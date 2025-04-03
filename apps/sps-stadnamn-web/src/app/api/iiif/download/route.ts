import { jsPDF } from 'jspdf';
import { fetchDoc } from '../../_utils/actions';
import { resolveLanguage } from '@/app/iiif/[[...slug]]/iiif-utils';

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
    const canvases = data._source.canvases;

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
            const imageUrl = `https://iiif.test.ubbe.no/iiif/image/stadnamn/${manifestDataset.toUpperCase()}/${canvas.image}/full/max/0/default.jpg`;
            const response = await fetch(imageUrl);
            if (!response.ok) {
                throw new Error(`Failed to fetch image: ${response.statusText}`);
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
        return new Response(pdfBuffer, {
            headers: {
                'Content-Type': 'application/pdf',
                'Content-Disposition': `attachment; filename*=UTF-8''${encodedFilename}`
            }
        });
    } else {
        // Handle single image download as JPG
        const imageUrl = `https://iiif.test.ubbe.no/iiif/image/stadnamn/${manifestDataset.toUpperCase()}/${selectedCanvases[0].image}/full/max/0/default.jpg`;
        const response = await fetch(imageUrl);
        if (!response.ok) {
            return Response.json({ error: 'Failed to fetch image' }, { status: 500 });
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
