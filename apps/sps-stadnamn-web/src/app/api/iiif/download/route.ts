import { jsPDF } from 'jspdf';
import { fetchDoc } from '../../_utils/actions';
import { resolveLanguage } from '@/app/iiif/iiif-utils';
import { fetchIIIFSearch } from '../iiif-search';
// eslint-disable-next-line import/no-unresolved
import JSZip from 'jszip';

export async function GET(request: Request) {
    const url = new URL(request.url);
    const uuid = url.searchParams.get('uuid');
    const format = url.searchParams.get('format')?.toLowerCase();
    const page = url.searchParams.get('page');


    if (!uuid) {
        return Response.json({ error: 'uuid is required' }, { status: 400 });
    }

    const data = await fetchDoc({ uuid: uuid as string });
    const manifestDataset = data._index.split('-')[2].split('_')[1];
    const outputFilename = resolveLanguage(data._source.label);

    // Handle Collections by fetching contained manifests/items
    if (data._source.type === 'Collection') {
        const fmt = format || 'pdf';

        // Fetch manifests within the collection
        const { response } = await fetchIIIFSearch(data._source.uuid, undefined, 'Manifest', 5000);
        const hits = response?.hits?.hits || [];

        if (!hits.length) {
            return Response.json({ error: 'Collection is empty' }, { status: 404 });
        }

        if (fmt === 'jpgs') {
            const zip = new JSZip();
            for (const hit of hits) {
                const itemDataset = hit._index.split('-')[2].split('_')[1];
                const images = hit._source?.images || [];
                const manifestFolderName = resolveLanguage(hit._source?.label) || hit._source?.uuid || 'manifest';
                const folder = zip.folder(manifestFolderName) as any;

                for (let i = 0; i < images.length; i++) {
                    const img = images[i];
                    const imageUrl = `https://iiif.spraksamlingane.no/iiif/image/stadnamn/${itemDataset.toUpperCase()}/${img.uuid}/full/max/0/default.tif`;
                    const resp = await fetch(imageUrl);
                    if (!resp.ok) continue;
                    const buffer = await resp.arrayBuffer();
                    const label = img.label?.none || img.label?.no || img.label?.en || img.label;
                    const filename = `${(Array.isArray(label) ? label[0] : label) || String(i + 1).padStart(4, '0')}.jpg`;
                    folder.file(filename, Buffer.from(buffer));
                }
            }

            const zipBuffer = await zip.generateAsync({ type: 'nodebuffer', compression: 'DEFLATE', compressionOptions: { level: 6 } });
            const filename = `${outputFilename}-jpgs.zip`;
            const encodedFilename = encodeURIComponent(filename);
            return new Response(new Uint8Array(zipBuffer), {
                headers: {
                    'Content-Type': 'application/zip',
                    'Content-Disposition': `attachment; filename*=UTF-8''${encodedFilename}`
                }
            });
        }

        if (fmt === 'multipdf') {
            const zip = new JSZip();
            for (const hit of hits) {
                const itemDataset = hit._index.split('-')[2].split('_')[1];
                const images = hit._source?.images || [];
                if (!images.length) continue;

                const manifestName = resolveLanguage(hit._source?.label) || hit._source?.uuid || 'manifest';

                const addImageToPdf = async (canvas: any, pageIndex: number, pdf: jsPDF) => {
                    const imageUrl = `https://iiif.spraksamlingane.no/iiif/image/stadnamn/${itemDataset.toUpperCase()}/${canvas.uuid}/full/max/0/default.tif`;
                    const response = await fetch(imageUrl);
                    if (!response.ok) return;
                    const arrayBuffer = await response.arrayBuffer();
                    const base64 = Buffer.from(arrayBuffer).toString('base64');
                    const base64Image = `data:image/jpeg;base64,${base64}`;
                    const { width, height } = canvas;
                    if (pageIndex > 0) {
                        pdf.addPage([width, height]);
                    }
                    pdf.addImage(base64Image, 'JPEG', 0, 0, width, height);
                };

                const firstCanvas = images[0];
                const pdf = new jsPDF({
                    orientation: firstCanvas.width > firstCanvas.height ? 'landscape' : 'portrait',
                    unit: 'px',
                    format: [firstCanvas.width, firstCanvas.height]
                });

                for (let i = 0; i < images.length; i++) {
                    await addImageToPdf(images[i], i, pdf);
                }

                const pdfBuffer = Buffer.from(pdf.output('arraybuffer'));
                zip.file(`${manifestName}.pdf`, pdfBuffer);
            }

            const zipBuffer = await zip.generateAsync({ type: 'nodebuffer', compression: 'DEFLATE', compressionOptions: { level: 6 } });
            const filename = `${outputFilename}-pdfs.zip`;
            const encodedFilename = encodeURIComponent(filename);
            return new Response(new Uint8Array(zipBuffer), {
                headers: {
                    'Content-Type': 'application/zip',
                    'Content-Disposition': `attachment; filename*=UTF-8''${encodedFilename}`
                }
            });
        }

        // Build a flat list of canvases with dataset info
        const items: { width: number; height: number; uuid: string; dataset: string }[] = [];
        for (const hit of hits) {
            const itemDataset = hit._index.split('-')[2].split('_')[1];
            const images = hit._source?.images || [];
            for (const img of images) {
                items.push({ width: img.width, height: img.height, uuid: img.uuid, dataset: itemDataset });
            }
        }

        if (!items.length) {
            return Response.json({ error: 'No images found in collection' }, { status: 404 });
        }

        // Create a single combined PDF
        const addImageToPdf = async (
            canvas: { width: number; height: number; uuid: string; dataset: string },
            pageIndex: number,
            pdf: jsPDF
        ) => {
            const imageUrl = `https://iiif.spraksamlingane.no/iiif/image/stadnamn/${canvas.dataset.toUpperCase()}/${canvas.uuid}/full/max/0/default.tif`;
            const response = await fetch(imageUrl);
            if (!response.ok) {
                throw new Error(`Failed to fetch image: ${response.statusText}\n${imageUrl}`);
            }
            const arrayBuffer = await response.arrayBuffer();
            const base64 = Buffer.from(arrayBuffer).toString('base64');
            const base64Image = `data:image/jpeg;base64,${base64}`;

            const { width, height } = canvas;
            if (pageIndex > 0) {
                pdf.addPage([width, height]);
            }
            pdf.addImage(base64Image, 'JPEG', 0, 0, width, height);
        };

        const first = items[0];
        const pdf = new jsPDF({
            orientation: first.width > first.height ? 'landscape' : 'portrait',
            unit: 'px',
            format: [first.width, first.height]
        });

        for (let i = 0; i < items.length; i++) {
            await addImageToPdf(items[i], i, pdf);
        }

        const pdfBuffer = Buffer.from(pdf.output('arraybuffer'));
        const filename = `${outputFilename}.pdf`;
        const encodedFilename = encodeURIComponent(filename);
        return new Response(new Uint8Array(pdfBuffer), {
            headers: {
                'Content-Type': 'application/pdf',
                'Content-Disposition': `attachment; filename*=UTF-8''${encodedFilename}`
            }
        });
    }

    const canvases = data._source.images;

    if (!canvases || !canvases.length) {
        return Response.json({ error: data }, { status: 404 });
    }

    // If page parameter is provided, validate and use only that page
    const selectedCanvases = page !== null
        ? [canvases[parseInt(page, 10)]]
        : canvases;

    if (page !== null && !selectedCanvases[0]) {
        return Response.json({ error: 'Invalid page number' }, { status: 400 });
    }

    // Get preferred format from Accept header
    const acceptHeader = request.headers.get('Accept');

    // Check format preference from query param first, then Accept header, then default based on page count
    const wantsPDF = format === 'pdf' ||
        (!format && (acceptHeader?.includes('application/pdf') || selectedCanvases.length > 1));

    if (wantsPDF) {
        // Function to load image and add to PDF
        const addImageToPdf = async (canvas: any, pageIndex: number, pdf: jsPDF) => {
            const imageUrl = `https://iiif.spraksamlingane.no/iiif/image/stadnamn/${manifestDataset.toUpperCase()}/${canvas.uuid}/full/max/0/default.tif`;
            const response = await fetch(imageUrl);
            if (!response.ok) {
                throw new Error(`Failed to fetch image: ${response.statusText}\n${imageUrl}\n${JSON.stringify(canvas)}`);
            }
            const arrayBuffer = await response.arrayBuffer();
            const base64 = Buffer.from(arrayBuffer).toString('base64');
            const base64Image = `data:image/jpeg;base64,${base64}`;

            // Get original image dimensions from canvas data
            const { width, height } = canvas;

            if (pageIndex > 0) {
                // Add new page with correct orientation and size
                pdf.addPage([width, height]);
            }

            // Add image at full size
            pdf.addImage(base64Image, 'JPEG', 0, 0, width, height);
        };

        // Create PDF with first page size matching first image
        const firstCanvas = selectedCanvases[0];
        const pdf = new jsPDF({
            orientation: firstCanvas.width > firstCanvas.height ? 'landscape' : 'portrait',
            unit: 'px',
            format: [firstCanvas.width, firstCanvas.height]
        });

        // Add all images to PDF
        for (let i = 0; i < selectedCanvases.length; i++) {
            await addImageToPdf(selectedCanvases[i], i, pdf);
        }

        const pdfBuffer = Buffer.from(pdf.output('arraybuffer'));
        const filename = `${outputFilename}.pdf`;
        const encodedFilename = encodeURIComponent(filename);
        return new Response(new Uint8Array(pdfBuffer), {
            headers: {
                'Content-Type': 'application/pdf',
                'Content-Disposition': `attachment; filename*=UTF-8''${encodedFilename}`
            }
        });
    } else {
        // Handle single image download as JPG
        const imageUrl = `https://iiif.spraksamlingane.no/iiif/image/stadnamn/${manifestDataset.toUpperCase()}/${selectedCanvases[0].uuid}/full/max/0/default.tif`;
        const response = await fetch(imageUrl);
        if (!response.ok) {
            return Response.json({ error: `Failed to fetch image: ${response.statusText}\n${imageUrl}` }, { status: 500 });
        }
        const imageBuffer = await response.arrayBuffer();

        const filename = `${outputFilename}.jpg`;
        const encodedFilename = encodeURIComponent(filename);
        return new Response(imageBuffer, {
            headers: {
                'Content-Type': 'image/jpeg',
                'Content-Disposition': `attachment; filename*=UTF-8''${encodedFilename}`
            }
        });
    }
}
