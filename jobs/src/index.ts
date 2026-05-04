import Fastify from "fastify";
import axios from "axios";
import cron from "node-cron";
import { Buffer } from "buffer";

import { config } from "./config/env";
import { getSuperuserPB } from "./lib/pb";
import { runJob } from "./lib/job-logger";

import index状态监控ingJobs from "./monitoring/indexer";
import { run状态监控ingJobs, run状态监控ingJobsWithOptions } from "./monitoring/runner";
import { runVersionComparisonRunner } from "./updates/comparison-runner";
import { newsFeedBuilder } from "./news/feed-builder";
import { processQueuedNotifications } from "./notifications/forwarder";

const fastify = Fastify({ logger: true });

const jobsAuthHeader = {
  Authorization: `Basic ${Buffer.from(
    `${config.PB_ADMIN_EMAIL}:${config.PB_ADMIN_PASSWORD}`,
    "utf-8"
  ).toString("base64")}`,
};

console.log("dashwise job runner is active");
// connect to pocketbase
getSuperuserPB().then(pb => {
  console.log("Connected to Pocketbase")
}).catch((error) => {
  console.error(error)
});


// search items
async function trigger搜索ItemIndexing() {
  try {
    const response = await axios.get(`${config.DASHWISE_URL}/api/v1/jobs/searchItems`, {
      headers: jobsAuthHeader,
    });
    console.log("搜索 items job triggered successfully:", response.status);
  } catch (error) {
    console.error("Error triggering search items indexing:", error);
  }
}

const run搜索ItemsJob = (triggerSource: string) =>
  runJob("searchItemsIndexer", trigger搜索ItemIndexing, {
    startMessage: `Triggered by ${triggerSource}`,
    successMessage: "搜索 items indexing completed",
    errorMessage: "搜索 items indexing failed",
  });

cron.schedule(config.SEARCHITEMS_SCHEDULE, () => {
  void run搜索ItemsJob("cron schedule").catch((error) =>
    console.error("搜索 items cron job failed:", error)
  );
});

fastify.get("/webhook/searchItemIndexer", async (request, reply) => {
  console.log("Webhook received");
  try {
    await run搜索ItemsJob("webhook");
    reply.send({ message: "搜索 item indexing triggered" });
  } catch (error) {
    reply.status(500).send({
      message: "搜索 item indexing failed",
      error: error instanceof Error ? error.message : String(error),
    });
  }
});

// refresh icons
async function triggerPullIconsJob() {
  try {
    const response = await axios.get(`${config.DASHWISE_URL}/api/v1/jobs/pullIcons`, {
      headers: jobsAuthHeader,
    });
    console.log("Pull icons job triggered successfully:", response.status);
  } catch (error) {
    console.error("Error triggering pull icons job:", error);
  }
}

const runPullIconsJob = (triggerSource: string) =>
  runJob("pullIcons", triggerPullIconsJob, {
    startMessage: `Triggered by ${triggerSource}`,
    successMessage: "Pull icons job completed",
    errorMessage: "Pull icons job failed",
  });

if (config.ENABLE_ICONS_REFRESH === true) {
  cron.schedule(config.PULL_ICONS_SCHEDULE, () => {
    void runPullIconsJob("cron schedule").catch((error) =>
      console.error("Pull icons cron job failed:", error)
    );
  });
}

fastify.get("/webhook/pullIcons", async (request, reply) => {
  console.log("Webhook received");
  try {
    await runPullIconsJob("webhook");
    reply.send({ message: "Pull icons job triggered" });
  } catch (error) {
    reply.status(500).send({
      message: "Pull icons job failed",
      error: error instanceof Error ? error.message : String(error),
    });
  }
});

//link monitoring: indexer
const run监控ingIndexerJob = (triggerSource: string) =>
  runJob("status监控ingIndexer", index状态监控ingJobs, {
    startMessage: `Triggered by ${triggerSource}`,
    successMessage: "状态 monitoring indexer completed",
    errorMessage: "状态 monitoring indexer failed",
  });

cron.schedule(config.MONITORING_INDEXER_SCHEDULE, () => {
  void run监控ingIndexerJob("cron schedule").catch((error) =>
    console.error("监控ing indexer cron job failed:", error)
  );
});

fastify.get("/webhook/status监控ingIndexer", async (request, reply) => {
  console.log("Webhook received");
  try {
    const result = await run监控ingIndexerJob("webhook");
    reply.send({ message: "status monitoring indexer triggered", result });
  } catch (error) {
    reply.status(500).send({
      message: "状态 monitoring indexer failed",
      error: error instanceof Error ? error.message : String(error),
    });
  }
});

//link monitoring: runner
const run监控ingRunnerJob = (triggerSource: string, options?: { source?: string; linkId?: string }) =>
  runJob("status监控ingRunner", () => {
    if (options?.source || options?.linkId) {
      return run状态监控ingJobsWithOptions(options);
    }
    return run状态监控ingJobs();
  }, {
    startMessage: `Triggered by ${triggerSource}${options?.linkId ? ` for link ${options.linkId}` : options?.source ? ` for source ${options.source}` : ""}`,
    successMessage: "状态 monitoring runner completed",
    errorMessage: "状态 monitoring runner failed",
  });

cron.schedule(config.MONITORING_RUNNER_SCHEDULE, () => {
  void run监控ingRunnerJob("cron schedule").catch((error) =>
    console.error("监控ing runner cron job failed:", error)
  );
});

fastify.get("/webhook/status监控ingRunner", async (request, reply) => {
  console.log("Webhook received");
  try {
    const { source, linkId } = request.query as { source?: string; linkId?: string };
    const options: { source?: string; linkId?: string } = {};
    if (typeof source === "string" && source.trim()) {
      options.source = source;
    }
    if (typeof linkId === "string" && linkId.trim()) {
      options.linkId = linkId;
    }

    const result = await run监控ingRunnerJob("webhook", options);
    reply.send({ message: "status monitoring runner triggered", result });
  } catch (error) {
    reply.status(500).send({
      message: "状态 monitoring runner failed",
      error: error instanceof Error ? error.message : String(error),
    });
  }
});

//update checks
const runComparisonJob = (triggerSource: string) =>
  runJob("comparisonRunner", runVersionComparisonRunner, {
    startMessage: `Triggered by ${triggerSource}`,
    successMessage: "Comparison runner completed",
    errorMessage: "Comparison runner failed",
  });

void runComparisonJob("initial run").catch((error) =>
  console.error("Comparison runner failed on startup:", error)
);

cron.schedule(config.UPDATE_CHECK_SCHEDULE, () => {
  void runComparisonJob("scheduled run").catch((error) =>
    console.error("Comparison runner cron job failed:", error)
  );
});

const runNewsFeedBuilderJob = (triggerSource: string, feedId?: string) =>
  runJob(
    "newsFeedBuilder",
    () => newsFeedBuilder(feedId),
    {
      startMessage: `Triggered by ${triggerSource}${feedId ? ` for feed ${feedId}` : ""}`,
      successMessage: "News feed builder completed",
      errorMessage: "News feed builder failed",
    }
  );

void runNewsFeedBuilderJob("initial run").catch((error) =>
  console.error("News feed builder failed on startup:", error)
);

cron.schedule(config.FEED_BUILDING_SCHEDULE, () => {
  void runNewsFeedBuilderJob("scheduled run").catch((error) =>
    console.error("News feed builder cron job failed:", error)
  );
});


fastify.get("/webhook/newsFeedBuilder", async (request, reply) => {
  const { feedId } = request.query as { feedId?: string };
  console.log("Webhook received", feedId ? `for feed ${feedId}` : "for all feeds");
  try {
    const result = await runNewsFeedBuilderJob("webhook", feedId);
    reply.send({ message: "news feed builder triggered", result });
  } catch (error) {
    reply.status(500).send({
      message: "News feed builder failed",
      error: error instanceof Error ? error.message : String(error),
    });
  }
});

//notification forwarding
const runNotificationForwarderJob = (triggerSource: string) =>
  runJob("notificationForwarder", processQueuedNotifications, {
    startMessage: `Triggered by ${triggerSource}`,
    successMessage: "Notification forwarder completed",
    errorMessage: "Notification forwarder failed",
  });

cron.schedule(config.NOTIFICATION_FORWARDER_SCHEDULE, () => {
  void runNotificationForwarderJob("cron schedule").catch((error) =>
    console.error("Notification forwarder cron job failed:", error)
  );
});

fastify.post("/api/forward-notifications", async (request, reply) => {
  console.log("Notification forwarding webhook received");
  try {
    await runNotificationForwarderJob("api");
    reply.send({ message: "notification forwarding triggered" });
  } catch (error) {
    reply.status(500).send({
      message: "Notification forwarding failed",
      error: error instanceof Error ? error.message : String(error),
    });
  }
});

// Start http server
fastify.listen({ port: 3001, host: "0.0.0.0" });
