import { readFileSync } from "node:fs";
import path from "node:path";

export type InvoicePdfLineItem = {
    name: string;
    size?: string;
    quantity: number;
    unitPrice: number;
    total: number;
    customizations?: string[];
};

export type InvoicePdfInput = {
    invoiceNumber: string;
    paymentReference: string;
    paidAt: string;
    customerName: string;
    customerEmail: string;
    customerPhone?: string;
    fulfilmentMethod: string;
    fulfilmentAddress?: string[];
    items: InvoicePdfLineItem[];
    subtotal: number;
    deliveryFee: number;
    couponCode?: string | null;
    couponDiscount: number;
    total: number;
    legalName: string;
    address: string;
    registrationNumber?: string;
    vatNumber?: string;
    supportEmail?: string;
};

const PAGE_WIDTH = 595;
const PAGE_HEIGHT = 842;
const LEFT = 48;
const RIGHT = PAGE_WIDTH - 48;
const LOGO_WIDTH = 500;
const LOGO_HEIGHT = 160;
const LOGO_X = (PAGE_WIDTH - LOGO_WIDTH) / 2;
const LOGO_Y = 660;

const money = (value: number) => `R ${Number(value || 0).toFixed(2)}`;

const ascii = (value: unknown) =>
    String(value ?? "")
        .normalize("NFKD")
        .replace(/[\u2018\u2019]/g, "'")
        .replace(/[\u201C\u201D]/g, '"')
        .replace(/[\u2013\u2014]/g, "-")
        .replace(/[^\x20-\x7E]/g, "");

const pdfEscape = (value: unknown) =>
    ascii(value)
        .replace(/\\/g, "\\\\")
        .replace(/\(/g, "\\(")
        .replace(/\)/g, "\\)");

const wrap = (value: string, maxChars: number) => {
    const clean = ascii(value).trim();

    if (!clean) return [""];

    const words = clean.split(/\s+/);
    const lines: string[] = [];
    let line = "";

    for (const word of words) {
        const candidate = line ? `${line} ${word}` : word;

        if (candidate.length <= maxChars) {
            line = candidate;
            continue;
        }

        if (line) {
            lines.push(line);
        }

        if (word.length <= maxChars) {
            line = word;
            continue;
        }

        let remainder = word;
        while (remainder.length > maxChars) {
            lines.push(remainder.slice(0, maxChars));
            remainder = remainder.slice(maxChars);
        }
        line = remainder;
    }

    if (line) lines.push(line);
    return lines.length ? lines : [""];
};

const approximateWidth = (value: string, size: number) =>
    ascii(value).length * size * 0.52;

export const buildInvoicePdf = (input: InvoicePdfInput) => {
    const pages: string[][] = [[]];
    const logoBytes = readFileSync(
        path.join(process.cwd(), "public", "invoice", "allwear-active-letterhead.jpg")
    );
    let pageIndex = 0;
    let y = 0;

    const current = () => pages[pageIndex];

    const text = (
        x: number,
        yPos: number,
        size: number,
        value: unknown,
        bold = false
    ) => {
        current().push(
            `BT /${bold ? "F2" : "F1"} ${size} Tf ${x.toFixed(2)} ${yPos.toFixed(
                2
            )} Td (${pdfEscape(value)}) Tj ET`
        );
    };

    const rightText = (
        xRight: number,
        yPos: number,
        size: number,
        value: unknown,
        bold = false
    ) => {
        const rendered = ascii(value);
        const x = Math.max(LEFT, xRight - approximateWidth(rendered, size));
        text(x, yPos, size, rendered, bold);
    };

    const line = (x1: number, y1: number, x2: number, y2: number, width = 0.6) => {
        current().push(
            `${width.toFixed(2)} w ${x1.toFixed(2)} ${y1.toFixed(2)} m ${x2.toFixed(
                2
            )} ${y2.toFixed(2)} l S`
        );
    };

    const image = (x: number, yPos: number, width: number, height: number) => {
        current().push(
            `q ${width.toFixed(2)} 0 0 ${height.toFixed(2)} ${x.toFixed(2)} ${yPos.toFixed(2)} cm /Logo Do Q`
        );
    };

    const pageFooter = () => {
        line(LEFT, 42, RIGHT, 42, 0.4);
        text(LEFT, 27, 7.5, "Thank you for shopping with Allwear Active.");
        rightText(RIGHT, 27, 7.5, `Page ${pageIndex + 1}`);
    };

    const newPage = (continuation = false) => {
        if (pageIndex > 0 || current().length > 0) {
            pageFooter();
            pages.push([]);
            pageIndex += 1;
        }

        image(LOGO_X, LOGO_Y, LOGO_WIDTH, LOGO_HEIGHT);
        rightText(
            RIGHT,
            636,
            15,
            continuation ? "INVOICE - CONTINUED" : "PAID INVOICE",
            true
        );
        line(LEFT, 620, RIGHT, 620, 1);
        y = 594;
    };

    const ensureSpace = (height: number) => {
        if (y - height < 70) {
            newPage(true);
            drawTableHeader();
        }
    };

    const drawTableHeader = () => {
        text(LEFT, y, 8, "ITEM", true);
        text(328, y, 8, "SIZE", true);
        text(378, y, 8, "QTY", true);
        rightText(472, y, 8, "UNIT", true);
        rightText(RIGHT, y, 8, "TOTAL", true);
        y -= 8;
        line(LEFT, y, RIGHT, y, 0.5);
        y -= 14;
    };

    newPage(false);

    text(LEFT, y, 9, "Invoice number", true);
    text(145, y, 9, input.invoiceNumber);
    text(320, y, 9, "Paid", true);
    text(370, y, 9, new Date(input.paidAt).toLocaleString("en-ZA"));
    y -= 16;

    text(LEFT, y, 9, "Paystack reference", true);
    text(145, y, 9, input.paymentReference);
    text(320, y, 9, "Method", true);
    text(370, y, 9, input.fulfilmentMethod);
    y -= 28;

    text(LEFT, y, 10, "BILL TO", true);
    y -= 16;
    text(LEFT, y, 10, input.customerName || "Customer", true);
    y -= 14;
    text(LEFT, y, 9, input.customerEmail);
    y -= 13;
    if (input.customerPhone) {
        text(LEFT, y, 9, input.customerPhone);
        y -= 13;
    }

    for (const addressLine of input.fulfilmentAddress || []) {
        if (!addressLine) continue;
        text(LEFT, y, 8.5, addressLine);
        y -= 12;
    }

    y -= 10;
    drawTableHeader();

    for (const item of input.items) {
        const nameLines = wrap(item.name || "Item", 47);
        const customizationLines = (item.customizations || []).flatMap((entry) =>
            wrap(`+ ${entry}`, 50)
        );
        const totalLines = Math.max(1, nameLines.length + customizationLines.length);
        const rowHeight = totalLines * 11 + 10;
        ensureSpace(rowHeight);

        let rowY = y;
        for (let index = 0; index < nameLines.length; index += 1) {
            text(LEFT, rowY, 8.5, nameLines[index], index === 0);
            rowY -= 11;
        }

        for (const customization of customizationLines) {
            text(LEFT + 8, rowY, 7.5, customization);
            rowY -= 10;
        }

        text(328, y, 8.5, item.size || "-");
        text(380, y, 8.5, String(item.quantity));
        rightText(472, y, 8.5, money(item.unitPrice));
        rightText(RIGHT, y, 8.5, money(item.total), true);

        y -= rowHeight;
        line(LEFT, y + 3, RIGHT, y + 3, 0.25);
        y -= 5;
    }

    if (y < 205) {
        newPage(true);
    }

    const totalsX = 355;
    y -= 6;
    text(totalsX, y, 9, "Subtotal");
    rightText(RIGHT, y, 9, money(input.subtotal));
    y -= 16;

    text(totalsX, y, 9, "Delivery");
    rightText(RIGHT, y, 9, money(input.deliveryFee));
    y -= 16;

    if (input.couponDiscount > 0) {
        text(
            totalsX,
            y,
            9,
            input.couponCode ? `Discount (${input.couponCode})` : "Discount"
        );
        rightText(RIGHT, y, 9, `- ${money(input.couponDiscount)}`);
        y -= 16;
    }

    line(totalsX, y + 7, RIGHT, y + 7, 0.7);
    text(totalsX, y - 7, 11, "TOTAL PAID", true);
    rightText(RIGHT, y - 7, 11, money(input.total), true);
    y -= 42;

    text(LEFT, y, 9, input.legalName, true);
    y -= 13;
    for (const businessLine of wrap(input.address, 90)) {
        text(LEFT, y, 8, businessLine);
        y -= 11;
    }
    if (input.registrationNumber) {
        text(LEFT, y, 8, `Registration: ${input.registrationNumber}`);
        y -= 11;
    }
    if (input.vatNumber) {
        text(LEFT, y, 8, `VAT number: ${input.vatNumber}`);
        y -= 11;
    }
    if (input.supportEmail) {
        text(LEFT, y, 8, `Support: ${input.supportEmail}`);
    }

    pageFooter();

    const objects = new Map<number, string>();
    const pageObjectIds: number[] = [];

    objects.set(1, "<< /Type /Catalog /Pages 2 0 R >>");
    objects.set(3, "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>");
    objects.set(4, "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>");
    objects.set(
        5,
        `<< /Type /XObject /Subtype /Image /Width 2048 /Height 655 /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${logoBytes.length} >>\nstream\n${logoBytes.toString("latin1")}\nendstream`
    );

    pages.forEach((commands, index) => {
        const pageObjectId = 6 + index * 2;
        const contentObjectId = 7 + index * 2;
        pageObjectIds.push(pageObjectId);

        const stream = commands.join("\n");
        const streamLength = Buffer.byteLength(stream, "latin1");

        objects.set(
            pageObjectId,
            `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${PAGE_WIDTH} ${PAGE_HEIGHT}] /Resources << /Font << /F1 3 0 R /F2 4 0 R >> /XObject << /Logo 5 0 R >> >> /Contents ${contentObjectId} 0 R >>`
        );
        objects.set(
            contentObjectId,
            `<< /Length ${streamLength} >>\nstream\n${stream}\nendstream`
        );
    });

    objects.set(
        2,
        `<< /Type /Pages /Kids [${pageObjectIds
            .map((id) => `${id} 0 R`)
            .join(" ")}] /Count ${pageObjectIds.length} >>`
    );

    const maxObjectId = Math.max(...objects.keys());
    const offsets: number[] = new Array(maxObjectId + 1).fill(0);
    let pdf = "%PDF-1.4\n%Allwear Active Invoice\n";

    for (let id = 1; id <= maxObjectId; id += 1) {
        offsets[id] = Buffer.byteLength(pdf, "latin1");
        pdf += `${id} 0 obj\n${objects.get(id) || "<< >>"}\nendobj\n`;
    }

    const xrefOffset = Buffer.byteLength(pdf, "latin1");
    pdf += `xref\n0 ${maxObjectId + 1}\n`;
    pdf += "0000000000 65535 f \n";

    for (let id = 1; id <= maxObjectId; id += 1) {
        pdf += `${String(offsets[id]).padStart(10, "0")} 00000 n \n`;
    }

    pdf += `trailer\n<< /Size ${maxObjectId + 1} /Root 1 0 R >>\n`;
    pdf += `startxref\n${xrefOffset}\n%%EOF`;

    return Buffer.from(pdf, "latin1");
};
