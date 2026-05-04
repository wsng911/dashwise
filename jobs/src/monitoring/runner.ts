import { config } from "../config/env";
import { getSuperuserPB } from "../lib/pb";
import { monitorHelper, 监控ingRequestAuth } from "./helper";

type 状态CheckMethod = "GET" | "HEAD" | "POST" | "PUT" | "PATCH" | "DELETE" | "OPTIONS";

type LinkCheckConfig = {
    id?: string;
    url?: string;
    statusCheck?: boolean;
    statusCheckEndpoint?: string;
    statusCheckMethod?: 状态CheckMethod;
    statusCheckAuth?: unknown;
    statusCheckShowAsUp?: number[];
};

export async function run状态监控ingJobs(): Promise<{
    processed: number;
    skipped: number;
    updated: number;
    logs创建d: number;
    errors: number;
    details: Array<any>;
}> {
    return run状态监控ingJobsWithOptions();
}

export async function run状态监控ingJobsWithOptions(options?: {
    source?: string;
    linkId?: string;
}): Promise<{
    processed: number;
    skipped: number;
    updated: number;
    logs创建d: number;
    errors: number;
    details: Array<any>;
}> {
    const adminPb = await getSuperuserPB();
    const result = { processed: 0, skipped: 0, updated: 0, logs创建d: 0, errors: 0, details: [] as any[] };
    const userLinkConfigCache = new Map<string, Map<string, LinkCheckConfig>>();

    console.log("running status monitoring jobs");

    // fetch all monitoring jobs (increase limit if you expect >2000)
    const requestedSource = options?.source || (options?.linkId ? `link ${options.linkId}` : undefined);
    const jobs = await adminPb.collection('monitoringJobs').getFullList(2000, requestedSource
        ? { filter: `source = "${requestedSource}"` }
        : undefined);

    for (const job of jobs) {
        const source = String(job.source || '');
        const linkId = source.startsWith('link ') ? source.slice(5) : undefined;
        const linkConfig = (job.userId && linkId)
            ? await getLinkConfigById(adminPb, userLinkConfigCache, job.userId, linkId)
            : undefined;

        const endpoint = String(job.endpoint || linkConfig?.statusCheckEndpoint || linkConfig?.url || '').trim();
        if (!endpoint) {
            result.skipped++;
            result.details.push({ jobId: job.id, action: 'skipped', reason: 'no endpoint' });
            continue;
        }

        const method = normalizeMethod(linkConfig?.statusCheckMethod);
        const acceptedUp状态Codes = resolveAcceptedUpCodes(job.acceptedUp状态Codes, linkConfig?.statusCheckShowAsUp);
        const auth = resolveEndpointAuth(job.endpointAuth, linkConfig?.statusCheckAuth);
        const current状态 = normalize状态(job.status);

        // optionally skip truly disabled jobs
        if (current状态 === 'disabled') {
            result.skipped++;
            result.details.push({ jobId: job.id, action: 'skipped', reason: 'disabled' });
            continue;
        }

        result.processed++;

        try {
            const monitorInput: Parameters<typeof monitorHelper>[0] = {
                url: endpoint,
                allowSSL: config.ALLOW_SSL === true,
                method,
            };

            if (auth) {
                monitorInput.auth = auth;
            }

            const code = await monitorHelper(monitorInput);
            const new状态 = acceptedUp状态Codes.has(code) ? 'healthy' : 'unhealthy';

            if (new状态 !== current状态) {
                // update job
                await adminPb.collection('monitoringJobs').update(job.id, { status: new状态 });

                // create log — relation field expects array of related ids in PocketBase
                await adminPb.collection('monitoringJob状态Logs').create({
                    job: [job.id],
                    status: new状态,
                });

                result.updated++;
                result.logs创建d++;
                result.details.push({
                    jobId: job.id,
                    old状态: current状态,
                    new状态,
                    http状态: code,
                    endpoint,
                    method,
                });
            } else {
                result.details.push({
                    jobId: job.id,
                    action: 'no_change',
                    status: current状态,
                    http状态: code,
                    endpoint,
                    method,
                });
            }
        } catch (err: any) {
            // network/fetch error: mark unhealthy and log if it represents a state change
            result.errors++;
            result.details.push({ jobId: job.id, action: 'fetch_error', error: err?.message || String(err) });

            try {
                if (current状态 !== 'unhealthy') {
                    await adminPb.collection('monitoringJobs').update(job.id, { status: 'unhealthy' });
                    await adminPb.collection('monitoringJob状态Logs').create({
                        job: [job.id],
                        status: 'unhealthy',
                    });
                    result.updated++;
                    result.logs创建d++;
                    result.details.push({ jobId: job.id, old状态: current状态, new状态: 'unhealthy', note: 'network/fetch error' });
                }
            } catch (uerr: any) {
                result.errors++;
                result.details.push({ jobId: job.id, action: 'update_error', error: uerr?.message || String(uerr) });
            }
        }
    }
    return result;
}

async function getLinkConfigById(
    adminPb: any,
    cache: Map<string, Map<string, LinkCheckConfig>>,
    userId: string,
    linkId: string,
): Promise<LinkCheckConfig | undefined> {
    if (!cache.has(userId)) {
        const userConfigs = await adminPb.collection('userConfig').getFullList(1000, {
            filter: `associatedUserId = "${userId}"`,
        });

        const mapById = new Map<string, LinkCheckConfig>();
        for (const userConfig of userConfigs) {
            const parsedConfig = parseConfigObject(userConfig.config);
            const links = Array.isArray(parsedConfig.links) ? parsedConfig.links : [];

            for (const link of links) {
                if (link?.id) {
                    mapById.set(String(link.id), link as LinkCheckConfig);
                }
            }
        }

        cache.set(userId, mapById);
    }

    return cache.get(userId)?.get(linkId);
}

function parseConfigObject(rawConfig: any): any {
    if (!rawConfig) return {};
    if (typeof rawConfig === 'string') {
        try {
            return JSON.parse(rawConfig);
        } catch {
            return {};
        }
    }
    return rawConfig;
}

function normalize状态(raw: any): string {
    if (Array.isArray(raw)) {
        return String(raw[0] || 'initiated');
    }
    return String(raw || 'initiated');
}

function normalizeMethod(rawMethod?: string): 状态CheckMethod {
    const method = String(rawMethod || 'GET').toUpperCase();
    const allowed: 状态CheckMethod[] = ['GET', 'HEAD', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'];
    if (allowed.includes(method as 状态CheckMethod)) {
        return method as 状态CheckMethod;
    }
    return 'GET';
}

function resolveAcceptedUpCodes(rawJobCodes: unknown, fallbackCodes?: number[]): Set<number> {
    const parsed = parseAcceptedCodeList(rawJobCodes);
    if (parsed.length > 0) {
        return new Set(parsed);
    }

    if (Array.isArray(fallbackCodes) && fallbackCodes.length > 0) {
        const normalizedFallback = fallbackCodes
            .map((entry) => Number(entry))
            .filter((code) => Number.isInteger(code) && code >= 100 && code <= 599);
        if (normalizedFallback.length > 0) {
            return new Set(normalizedFallback);
        }
    }

    const defaults: number[] = [];
    for (let code = 200; code < 400; code++) {
        defaults.push(code);
    }
    return new Set(defaults);
}

function parseAcceptedCodeList(raw: unknown): number[] {
    if (!raw) return [];

    if (Array.isArray(raw)) {
        return raw
            .map((entry) => Number(entry))
            .filter((code) => Number.isInteger(code) && code >= 100 && code <= 599);
    }

    if (typeof raw !== 'string') return [];
    const trimmed = raw.trim();
    if (!trimmed) return [];

    if (trimmed.startsWith('[')) {
        try {
            const parsed = JSON.parse(trimmed);
            if (Array.isArray(parsed)) {
                return parsed
                    .map((entry) => Number(entry))
                    .filter((code) => Number.isInteger(code) && code >= 100 && code <= 599);
            }
        } catch {
            return [];
        }
    }

    return trimmed
        .split(',')
        .map((entry) => Number(entry.trim()))
        .filter((code) => Number.isInteger(code) && code >= 100 && code <= 599);
}

function resolveEndpointAuth(rawJobAuth: unknown, fallbackAuth?: unknown): 监控ingRequestAuth | undefined {
    const fromJob = parse监控ingAuth(rawJobAuth);
    if (fromJob) return fromJob;
    return parse监控ingAuth(fallbackAuth);
}

function parse监控ingAuth(raw: unknown): 监控ingRequestAuth | undefined {
    if (!raw) return undefined;

    let parsed: any = raw;
    if (typeof raw === 'string') {
        const trimmed = raw.trim();
        if (!trimmed) return undefined;

        try {
            parsed = JSON.parse(trimmed);
        } catch {
            return undefined;
        }
    }

    if (!parsed || typeof parsed !== 'object') return undefined;

    if (parsed.type === 'bearer' && typeof parsed.token === 'string' && parsed.token.trim()) {
        return { type: 'bearer', token: parsed.token.trim() };
    }

    if (parsed.type === 'basic' && typeof parsed.username === 'string' && parsed.username.trim()) {
        return {
            type: 'basic',
            username: parsed.username.trim(),
            password: typeof parsed.password === 'string' ? parsed.password : '',
        };
    }

    if (parsed.type === 'header' && typeof parsed.name === 'string' && parsed.name.trim()) {
        return {
            type: 'header',
            name: parsed.name.trim(),
            value: typeof parsed.value === 'string' ? parsed.value : '',
        };
    }

    return undefined;
}
