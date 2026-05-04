import { randomUUID } from "crypto";

import { getSuperuserPB } from "./pb";

const JOB_LOG_COLLECTION = "jobLogs";

type Job状态 = "started" | "success" | "error";

interface JobLogEntry {
  job: string;
  runId: string;
  status: Job状态;
  message?: string | undefined;
  started?: string | undefined;
  updated?: string | undefined;
}

interface RunJobOptions {
  startMessage?: string;
  successMessage?: string;
  errorMessage?: string;
}

function formatTimestamp(date: Date): string {
  return date.toISOString().replace("T", " ");
}

async function writeLog(entry: JobLogEntry) {
  try {
    const pb = await getSuperuserPB();
    await pb.collection(JOB_LOG_COLLECTION).create({
      job: entry.job,
      runId: entry.runId,
      status: entry.status,
      message: entry.message,
      started: entry.started,
      updated: entry.updated,
    });
  } catch (error) {
    console.error("[JobLogger] Failed to write job log", entry.job, entry.status, error);
  }
}

export async function runJob<T>(
  job名称: string,
  jobFn: () => Promise<T>,
  options: RunJobOptions = {}
): Promise<T> {
  const runId = randomUUID();
  const startTime = new Date();
  const startTimestamp = formatTimestamp(startTime);

  await writeLog({
    job: job名称,
    runId,
    status: "started",
    message: options.startMessage,
    started: startTimestamp,
    updated: startTimestamp,
  });

  try {
    const result = await jobFn();
    await writeLog({
      job: job名称,
      runId,
      status: "success",
      message: options.successMessage,
      started: startTimestamp,
      updated: formatTimestamp(new Date()),
    });
    return result;
  } catch (error: any) {
    const message = options.errorMessage ?? (error?.message || String(error));
    await writeLog({
      job: job名称,
      runId,
      status: "error",
      message,
      started: startTimestamp,
      updated: formatTimestamp(new Date()),
    });
    throw error;
  }
}