"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DEFAULT_UNIFIED_TERMS_AND_CONDITIONS = exports.DEFAULT_HARDWARE_ROWS = exports.DEFAULT_SOFTWARE_ROWS = exports.DEFAULT_HARDWARE_COLUMNS = exports.DEFAULT_SOFTWARE_COLUMNS = void 0;
exports.DEFAULT_SOFTWARE_COLUMNS = [
    { key: "sl", label: "SL", width: "7%" },
    { key: "scope", label: "Scope of Work", width: "28%" },
    { key: "particulars", label: "PARTICULARS", width: "51%" },
    { key: "amount", label: "AMOUNT", width: "14%" },
];
exports.DEFAULT_HARDWARE_COLUMNS = [
    { key: "sl", label: "SL", width: "8%" },
    { key: "product", label: "Product / Item", width: "32%" },
    { key: "specifications", label: "SPECIFICATIONS", width: "45%" },
    { key: "amount", label: "AMOUNT", width: "15%" },
];
exports.DEFAULT_SOFTWARE_ROWS = [
    {
        sl: 1,
        scope: "Dynamic Homepage & Pages",
        particulars: "Homepage with Export & Import sections, About Us, Mission & Vision, Contact Us",
    },
    {
        sl: 2,
        scope: "Product Management System",
        particulars: "Admin can add, update & delete products under Export & Import categories",
    },
    {
        sl: 3,
        scope: "Category Management",
        particulars: "Two main categories: Export & Import (both include jute & leather products)",
    },
    {
        sl: 4,
        scope: "Product Display System",
        particulars: "Users can browse products under Export & Import with details",
    },
    {
        sl: 5,
        scope: "Request for Quote System",
        particulars: "Users can request quotes for both Export & Import products",
    },
    {
        sl: 6,
        scope: "Admin Dashboard",
        particulars: "Full control over products, categories, quotes, users & website content",
    },
    {
        sl: 7,
        scope: "Quote Management",
        particulars: "Admin can view, respond & manage all Export & Import quote requests",
    },
    {
        sl: 8,
        scope: "Banner Management",
        particulars: "Admin can add & manage promotional banners",
    },
    {
        sl: 9,
        scope: "Partner / Client Management",
        particulars: "Add & display international partners/clients",
    },
    {
        sl: 10,
        scope: "Content Management System",
        particulars: "Manage About Us, Mission, Vision & other content pages",
    },
    {
        sl: 11,
        scope: "Security & System Support",
        particulars: "SSL, data protection & basic maintenance support",
    },
];
exports.DEFAULT_HARDWARE_ROWS = [
    {
        sl: 1,
        product: "POS Thermal Receipt Printer (80mm)",
        specifications: "High-speed thermal printing with auto-cutter, USB + LAN dual interface",
        amount: 6500,
    },
    {
        sl: 2,
        product: "Heavy-Duty Cash Drawer",
        specifications: "5 bill / 8 coin compartments with RJ11 auto kick-out interface",
        amount: 4500,
    },
    {
        sl: 3,
        product: "1D / 2D Barcode Scanner",
        specifications: "Omnidirectional high-speed scanning for printed & screen barcodes",
        amount: 3500,
    },
    {
        sl: 4,
        product: "Thermal Paper Rolls (Pack of 10)",
        specifications: "80mm x 70mm premium BPA-free thermal receipt rolls",
        amount: 800,
    },
];
exports.DEFAULT_UNIFIED_TERMS_AND_CONDITIONS = `
<h3>15 Days' Time Breakdown (Export/Import / POS Solution)</h3>
<p><strong>Step 1: Planning & Core Setup</strong><br/>Project planning, UI/UX design, and basic system setup. Includes database architecture, authentication, and core layout setup.</p>
<p><strong>Step 2: Core Features Development</strong><br/>Development of main functionalities including product management, category setup, display system, and interactive modules.</p>
<p><strong>Step 3: Admin Panel & User System</strong><br/>Backend and control system development. Includes admin dashboard, user registration & login, quote/order management system, and content management.</p>
<p><strong>Step 4: Finalization & Launch</strong><br/>Testing, optimization, and deployment. Includes security setup (SSL), bug fixing, performance optimization, and final website/system launch with basic maintenance support.</p>

<p><strong>Programming Stack:</strong> Modern Next.js, React, Node.js, Express, MongoDB/PostgreSQL, Tailwind CSS, Nodemailer, Cloudinary API, etc.</p>

<p><em>***Note: The following goods and services must be purchased from your end if required: mobile OTP bundle pack, Android track API, Cloudinary API, server storage, SSL licenses for e-commerce, your domain and hosting. Later, we will let you know if we need anything more.</em></p>

<h3>Terms & Conditions:</h3>
<ol>
  <li>This budget does not include VAT or any other additional charges.</li>
  <li>The customer will provide all content, images, written company information and any other necessary items.</li>
  <li>To commence operations, an advance payment of 50% is required, 25% need to be paid after complete 50% work, and rest 25% to be paid at the time of final delivery. Within 01 month, the order will be cancelled if milestone payments are delayed.</li>
  <li>Delivery must be collected within 07 Days from the delivery date. If delivery not collected, client agrees to standard handover.</li>
  <li>This quotation will valid for 10 days from the issue date. After this period the price, terms may be subject to review based on project requirements and market conditions.</li>
  <li>An additional charge will apply for each extra page or feature that exceeds the agreed scope after final submission.</li>
  <li>We have a basic maintenance price (start from flexible monthly rate) if you need continuous web/system maintenance.</li>
  <li>Company will provide first three months' free maintenance.</li>
  <li>10% service fee applies if we involve any third-party services.</li>
  <li>The website/system language will be developed in English. Any additional language version will incur extra charges.</li>
</ol>

<h3>12. What will you provide us?</h3>
<ul>
  <li>a. Your Company Logo (PNG format without background / Vector).</li>
  <li>b. Your Domain & Hosting Access (if applicable).</li>
  <li>c. Contact information (WhatsApp, Contact number, address, Google map link etc.).</li>
  <li>d. Social Media links (Facebook, Instagram, YouTube etc.).</li>
  <li>e. Courier / Delivery API (If applicable).</li>
  <li>f. Payment Gateway API access (If you have).</li>
  <li>g. Bulk SMS API (If you have).</li>
  <li>h. Content for policy all pages & about page.</li>
</ul>

<h3>13. What access you will get from okobiz:</h3>
<ul>
  <li>a. You will receive the admin panel link along with your E-mail Id & Password. If you wish, you can change the password later.</li>
  <li>b. Additionally, guidance will be provided on how to operate the system effectively.</li>
  <li>c. okobiz, always ensures the privacy of your business remains protected.</li>
</ul>
`.trim();
