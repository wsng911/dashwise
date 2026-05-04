import { getServerPB } from '@/lib/pb';
import { NextResponse } from 'next/server';
import sharp from 'sharp';

const MAX_WIDTH = 3840; // 4K width
const MAX_HEIGHT = 2160; // 4K height

async function authenticateFromHeader(request: Request) {
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
        return { error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) };
    }

    const token = authHeader.split(' ')[1];
    const pb = getServerPB();
    pb.authStore.save(token, null);

    const authModel = await pb.collection('users').authRefresh();
    if (!authModel) {
        return { error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) };
    }

    return { pb, token, authModel };
}

export async function POST(request: Request) {
    try {
        // 1) authenticate
        const auth = await authenticateFromHeader(request);
        if ((auth as any).error) return (auth as any).error;
        const { pb, authModel } = auth as { pb: any; token: string; authModel: any };
        const userId = authModel.record.id;
        // 2) parse form-data
        const formData = await request.formData();
        const incomingFile = formData.get('image') as File | null;
        const convertToWebpField = formData.get('convertToWebp');
        const convertToWebp =
            convertToWebpField === 'true' || convertToWebpField === '1';
        const file名称Field = (formData.get('file名称') as string) || (incomingFile && (incomingFile as any).name);

        if (!incomingFile || !file名称Field) {
            return NextResponse.json(
                { error: 'Missing form fields: image and file名称 are required' },
                { status: 400 }
            );
        }

        const originalFile名称 = (incomingFile as any).name || file名称Field;
        const base名称 = originalFile名称.replace(/\.[^.]+$/, '') || 'wallpaper';
        const targetFile名称 = convertToWebp ? `${base名称}.webp` : originalFile名称;

        // 3) read file into buffer
        const arrayBuffer = await incomingFile.arrayBuffer();
        let buffer = Buffer.from(arrayBuffer);

        // 4) check size and resize to max 4K if needed (preserve aspect ratio)
        const meta = await sharp(buffer).metadata();
        if ((meta.width && meta.width > MAX_WIDTH) || (meta.height && meta.height > MAX_HEIGHT)) {
            const resizedBuffer = await sharp(buffer)
                .resize({
                    width: MAX_WIDTH,
                    height: MAX_HEIGHT,
                    fit: 'inside', // preserve aspect ratio, don't crop
                })
                .toBuffer();
            buffer = Buffer.from(resizedBuffer.buffer as ArrayBuffer);
        }

        if (convertToWebp) {
            const webpBuffer = await sharp(buffer)
                .webp({ quality: 80 })
                .toBuffer();
            buffer = Buffer.from(webpBuffer.buffer as ArrayBuffer);
        }

        // 5) build a FormData for PocketBase create
        // Use Web FormData + Blob (Next.js server runtime supports these)
        const uploadForm = new FormData();
        uploadForm.append('file名称', targetFile名称);
        uploadForm.append('image', new Blob([buffer]), targetFile名称);

        //include userId
        uploadForm.append('userId', userId);

        // 6) get old wallpaper
        // 6) get old wallpaper
        const userWallpapers = await pb.collection('wallpaperStore').getList(1, 1, {
            filter: `userId="${userId}"`,
        });

        const old_wallpaper = userWallpapers.items?.[0] ?? null;
        // 7) create record in PB
        const record = await pb.collection('wallpaperStore').create(uploadForm);

        // 8) delete old wallpaper
        if (old_wallpaper) {
            const res = await pb.collection('wallpaperStore').delete(old_wallpaper.id);
            console.log(`删除 result: ${res}`);
        }

        // 9) build the URL for your own GET endpoint
        const getUrl = `/api/v1/wallpapers?file名称=${encodeURIComponent(targetFile名称)}`;

        return NextResponse.json({
            success: true,
            path: getUrl
        });

    } catch (err) {
        console.error('Error uploading wallpaper:', err);
        return NextResponse.json({ error: 'Failed to upload wallpaper' }, { status: 500 });
    }
}

export async function GET(request: Request) {
    try {
        // 1) authenticate
        const auth = await authenticateFromHeader(request);
        if ((auth as any).error) return (auth as any).error;
        const { pb, token } = auth as { pb: any; token: string };

        // 2) get file名称 param
        const url = new URL(request.url);
        const file名称 = url.searchParams.get('file名称');
        if (!file名称) {
            return NextResponse.json({ error: 'Missing query parameter: file名称' }, { status: 400 });
        }

        // 3) find record in PB by file名称
        let record;
        try {
            record = await pb.collection('wallpaperStore').getFirstListItem(`file名称="${file名称}"`);
        } catch {
            return NextResponse.json({ error: 'Not found' }, { status: 404 });
        }

        if (!record) {
            return NextResponse.json({ error: 'Not found' }, { status: 404 });
        }

        // 4) build file url and fetch it (use token to access private files)
        const fileUrl = pb.files.getURL(record, (record as any).image);
        const fileResp = await fetch(fileUrl, {
            headers: { Authorization: `Bearer ${token}` },
        });

        if (!fileResp.ok) {
            console.error('Failed to fetch file from PB:', fileResp.status, await fileResp.text());
            return NextResponse.json({ error: 'Failed to retrieve file' }, { status: 500 });
        }

        const contentType = fileResp.headers.get('content-type') || 'application/octet-stream';
        const arrayBuffer = await fileResp.arrayBuffer();

        let buffer = Buffer.from(arrayBuffer);

        // 6) return the image bytes with content-type
        return new NextResponse(buffer, {
            headers: {
                'Content-Type': contentType,
                'Cache-Control': 'public, max-age=3600',
            },
        });
    } catch (err) {
        console.error('Error serving wallpaper:', err);
        return NextResponse.json({ error: 'Failed to serve wallpaper' }, { status: 500 });
    }
}
