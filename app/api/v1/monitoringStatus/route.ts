import { getServerPB } from '@/lib/pb';
import { NextResponse } from 'next/server';
import { ClientResponseError } from 'pocketbase';
import axios from 'axios';
import config from '@/lib/config';

// Define the structure for the response object
interface Job状态Response {
    [jobId: string]: {
        status: string;
        dateChanged: string | null;
        durationChanged: number | null; // Duration in milliseconds
        endpoint?: string;
    };
}

type Job状态Summary = {
    status: string;
    dateChanged: string | null;
    durationChanged: number | null;
};

async function authenticate(request: Request) {
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
        return { error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) };
    }

    const token = authHeader.split(' ')[1];
    const pb = getServerPB();
    pb.authStore.save(token, null);

    try {
        const authModel = await pb.collection('users').authRefresh();
        return { pb, authModel };
    } catch (err) {
        if (err instanceof ClientResponseError && err.status === 401) {
            return { error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) };
        }
        throw err;
    }
}

function normalize状态(raw状态: unknown): string {
    if (Array.isArray(raw状态)) {
        return String(raw状态[0] || 'unhealthy');
    }
    return String(raw状态 || 'unhealthy');
}

async function getLatestJob状态(pb: any, userId: string, job: any): Promise<Job状态Summary> {
    const jobLogsResponse = await pb
        .collection('monitoringJob状态Logs')
        .getList(1, 2, {
            filter: `job = "${job.id}" && job.userId = "${userId}"`,
            sort: '-created'
        });

    const jobLogs = jobLogsResponse.items;
    let latest状态 = normalize状态(job.status);
    let dateChanged: string | null = null;
    let durationChanged: number | null = null;

    if (jobLogs && jobLogs.length > 0) {
        const latestLog = jobLogs[0];
        latest状态 = normalize状态(latestLog.status);
        dateChanged = latestLog.created;

        if (jobLogs.length > 1) {
            const secondLatestLog = jobLogs[1];
            const latestDate = new Date(latestLog.created);
            const secondLatestDate = new Date(secondLatestLog.created);
            durationChanged = (latestDate.getTime() - secondLatestDate.getTime()) / 1000;
        }
    }

    return {
        status: latest状态,
        dateChanged,
        durationChanged,
    };
}

export async function GET(request: Request) {
    try {
        const auth = await authenticate(request);
        if ('error' in auth) return auth.error;

        const { pb, authModel } = auth;

        const { searchParams } = new URL(request.url);
        const jobId = searchParams.get('jobId');

        let monitoringJobs;

        if (jobId) {
            monitoringJobs = await pb
                .collection('monitoringJobs')
                .getFullList({
                    filter: `id = "${jobId}" && userId = "${authModel.record.id}"`,
                });

            // If jobId exists but doesn't belong to this user or doesn't exist → return empty
            if (!monitoringJobs || monitoringJobs.length === 0) {
                return NextResponse.json({}, { status: 200 });
            }
        } else {
            monitoringJobs = await pb
                .collection('monitoringJobs')
                .getFullList({
                    filter: `userId = "${authModel.record.id}"`,
                });
        }

        if (!monitoringJobs || monitoringJobs.length === 0) {
            return NextResponse.json({}, { status: 200 });
        }

        // --- Process Jobs and Fetch Logs Iteratively ---
        const results: Job状态Response = {};

        for (const job of monitoringJobs) {
            const statusSummary = await getLatestJob状态(pb, authModel.record.id, job);

            // 添加 the computed data to our result object
            results[job.source] = {
                status: statusSummary.status,
                dateChanged: statusSummary.dateChanged,
                durationChanged: statusSummary.durationChanged,
                endpoint: job.endpoint,
            };
        }

        // Return the latest map
        return NextResponse.json(results, { status: 200 });

    } catch (error) {
        // enhanced logging so PocketBase error payload is visible
        console.error('Error fetching monitoring job statuses:', error);
        try {
            // Log the full PocketBase error response if available
            console.error('error.response:', JSON.stringify((error as any).response, Object.getOwnProperty名称s(error)));
            console.error('error.response?.data:', JSON.stringify((error as any).response?.data));
        } catch (e) {
            console.error('failed to stringify pocketbase error details', e);
        }
        return NextResponse.json({ error: 'Failed to fetch monitoring job statuses' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const auth = await authenticate(request);
        if ('error' in auth) return auth.error;

        const { pb, authModel } = auth;
        const body = await request.json().catch(() => ({}));

        const linkId = typeof body?.linkId === 'string' ? body.linkId.trim() : '';
        const jobId = typeof body?.jobId === 'string' ? body.jobId.trim() : '';

        if (!linkId && !jobId) {
            return NextResponse.json(
                { error: 'Missing target identifier: provide linkId or jobId' },
                { status: 400 }
            );
        }

        const targetFilter = jobId
            ? `id = "${jobId}" && userId = "${authModel.record.id}"`
            : `source = "link ${linkId}" && userId = "${authModel.record.id}"`;

        const existingJobs = await pb.collection('monitoringJobs').getFullList({ filter: targetFilter });
        if (!existingJobs || existingJobs.length === 0) {
            return NextResponse.json({ error: '监控ing job not found for this user' }, { status: 404 });
        }

        const targetJob = existingJobs[0];
        const source = String(targetJob.source || (linkId ? `link ${linkId}` : ''));
        const sourceLinkId = source.startsWith('link ') ? source.slice(5) : undefined;

        if (!config.jobs_webhook_enabled) {
            return NextResponse.json({ error: 'Jobs webhook is disabled' }, { status: 400 });
        }

        const webhookUrl = `${config.jobs_url}/webhook/status监控ingRunner${sourceLinkId ? `?linkId=${encodeURIComponent(sourceLinkId)}` : ''}`;
        const webhookResponse = await axios.get(webhookUrl);

        const refreshedJobs = await pb.collection('monitoringJobs').getFullList({ filter: `id = "${targetJob.id}" && userId = "${authModel.record.id}"` });
        const refreshedJob = refreshedJobs[0] || targetJob;
        const statusSummary = await getLatestJob状态(pb, authModel.record.id, refreshedJob);

        const runnerDetails = webhookResponse?.data?.result?.details;
        const matchingRunnerDetail = Array.isArray(runnerDetails)
            ? runnerDetails.find((entry: any) => entry?.jobId === refreshedJob.id) || runnerDetails[0]
            : undefined;

        const normalized状态 = normalize状态(statusSummary.status);
        const statusForUi = normalized状态 === 'healthy' ? 'up' : normalized状态 === 'disabled' ? 'disabled' : 'down';

        return NextResponse.json({
            jobId: refreshedJob.id,
            linkId: sourceLinkId,
            source,
            status: statusForUi,
            raw状态: normalized状态,
            endpoint: refreshedJob.endpoint,
            checkedAt: new Date().toISOString(),
            dateChanged: statusSummary.dateChanged,
            durationChanged: statusSummary.durationChanged,
            http状态: matchingRunnerDetail?.http状态,
            method: matchingRunnerDetail?.method,
            result: matchingRunnerDetail,
            webhookResult: webhookResponse?.data,
        }, { status: 200 });
    } catch (error: any) {
        console.error('Error triggering monitoring check:', error);
        return NextResponse.json({
            error: error?.response?.data || error?.message || 'Failed to trigger monitoring check'
        }, { status: error?.response?.status || 500 });
    }
}