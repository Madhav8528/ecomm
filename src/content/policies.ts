export type PolicyBlock =
  | { type: "paragraph"; text: string }
  | { type: "unordered_list"; items: string[] }
  | { type: "ordered_list"; items: string[] };

export type PolicySection = {
  id: string;
  title: string;
  blocks: PolicyBlock[];
};

export type PolicyDocument = {
  title: string;
  intro?: string[];
  sections: PolicySection[];
};

export const termsAndConditionsDocument: PolicyDocument = {
  title: "Terms & Conditions",
  intro: [
    "Welcome to ClearPiece. By accessing our website, requesting quotations, placing orders, or engaging with our services, you agree to be bound by these Terms & Conditions.",
    "ClearPiece reserves the right to modify these Terms & Conditions at any time without prior notice.",
  ],
  sections: [
    {
      id: "introduction",
      title: "1. Introduction",
      blocks: [
        {
          type: "paragraph",
          text: "These Terms govern all quotations, orders, supplies, and related services offered by ClearPiece.",
        },
      ],
    },
    {
      id: "products-services",
      title: "2. Products & Services",
      blocks: [
        {
          type: "paragraph",
          text: "ClearPiece specializes in the manufacturing, sourcing, customization, branding, and supply of glass bottles, jars, glassware, tableware, packaging solutions, and related products.",
        },
        {
          type: "paragraph",
          text: "Product images, dimensions, capacities, colors, and finishes displayed on the website are indicative and may vary slightly from actual production.",
        },
      ],
    },
    {
      id: "quotations-pricing",
      title: "3. Quotations & Pricing",
      blocks: [
        {
          type: "unordered_list",
          items: [
            "All quotations are valid for 15 days unless otherwise specified.",
            "Prices are subject to revision based on raw material costs, energy costs, freight charges, taxes, currency fluctuations, and market conditions.",
            "All prices are exclusive of GST and logistics charges unless specifically stated.",
            "Only written quotations issued by ClearPiece shall be considered valid.",
          ],
        },
      ],
    },
    {
      id: "order-confirmation",
      title: "4. Order Confirmation",
      blocks: [
        { type: "paragraph", text: "Orders shall be considered confirmed only upon:" },
        {
          type: "unordered_list",
          items: [
            "Receipt of customer purchase order or written approval.",
            "Confirmation of specifications.",
            "Receipt of applicable advance payment (where required).",
          ],
        },
        {
          type: "paragraph",
          text: "Production shall commence only after final approval of specifications and artwork.",
        },
      ],
    },
    {
      id: "moq",
      title: "5. Minimum Order Quantities (MOQ)",
      blocks: [
        {
          type: "paragraph",
          text: "MOQ may vary depending on product category, customization requirements, printing process, and production feasibility.",
        },
        {
          type: "paragraph",
          text: "Orders below MOQ may be accepted at ClearPiece's sole discretion and may attract additional charges.",
        },
        {
          type: "paragraph",
          text: "MOQ exceptions granted for one order shall not constitute future entitlement.",
        },
      ],
    },
    {
      id: "customization-artwork",
      title: "6. Customization & Artwork Approval",
      blocks: [
        {
          type: "paragraph",
          text: "Customers are responsible for reviewing and approving all artwork, dimensions, specifications, and proofs prior to production.",
        },
        { type: "paragraph", text: "Once artwork approval is received:" },
        {
          type: "unordered_list",
          items: [
            "Production begins immediately.",
            "Changes may incur additional charges.",
            "Revised delivery timelines may apply.",
          ],
        },
        {
          type: "paragraph",
          text: "ClearPiece shall not be liable for errors present in customer-approved artwork.",
        },
      ],
    },
    {
      id: "design-support",
      title: "7. Design Support",
      blocks: [
        {
          type: "paragraph",
          text: "ClearPiece may provide design concepts, mockups, branding suggestions, or packaging recommendations as a value-added service.",
        },
        {
          type: "paragraph",
          text: "Final suitability, compliance, branding decisions, and approval remain the sole responsibility of the customer.",
        },
      ],
    },
    {
      id: "product-variations",
      title: "8. Product Variations",
      blocks: [
        {
          type: "paragraph",
          text: "Glass manufacturing may naturally result in minor variations including:",
        },
        {
          type: "unordered_list",
          items: [
            "Air bubbles",
            "Mold lines",
            "Weight variations",
            "Thickness variations",
            "Shade variations",
            "Slight printing position differences",
            "Minor handcrafted irregularities",
          ],
        },
        {
          type: "paragraph",
          text: "Such variations are considered industry standard and shall not constitute manufacturing defects.",
        },
      ],
    },
    {
      id: "development-charges",
      title: "9. Development Charges",
      blocks: [
        {
          type: "paragraph",
          text: "The following charges, where applicable, are non-refundable:",
        },
        {
          type: "unordered_list",
          items: [
            "Screen development charges",
            "Tooling charges",
            "Mold development charges",
            "Sampling charges",
            "Artwork development charges",
            "Design charges",
          ],
        },
      ],
    },
    {
      id: "intellectual-property",
      title: "10. Intellectual Property",
      blocks: [
        {
          type: "paragraph",
          text: "Customers represent and warrant that all logos, trademarks, artwork, and designs supplied by them are lawfully owned or authorized for use.",
        },
        {
          type: "paragraph",
          text: "ClearPiece shall not be responsible for trademark, copyright, design, or intellectual property disputes arising from customer-provided content.",
        },
      ],
    },
    {
      id: "marketing-rights",
      title: "11. Marketing & Portfolio Rights",
      blocks: [
        {
          type: "paragraph",
          text: "Unless specifically restricted in writing by the customer, ClearPiece reserves the right to photograph, display, publish, and showcase completed products and projects for:",
        },
        {
          type: "unordered_list",
          items: [
            "Website",
            "Social media",
            "Catalogues",
            "Marketing materials",
            "Presentations",
          ],
        },
      ],
    },
    {
      id: "payment-terms",
      title: "12. Payment Terms",
      blocks: [
        {
          type: "paragraph",
          text: "Payment terms shall be as specified in the quotation or invoice.",
        },
        { type: "paragraph", text: "Unless otherwise agreed:" },
        {
          type: "unordered_list",
          items: [
            "Advance payment may be required before production.",
            "Balance payment shall be payable before dispatch.",
          ],
        },
        {
          type: "paragraph",
          text: "Delayed payments may attract interest at 18% per annum.",
        },
      ],
    },
    {
      id: "limitation-of-liability",
      title: "13. Limitation of Liability",
      blocks: [
        {
          type: "paragraph",
          text: "Under no circumstances shall ClearPiece's liability exceed the value of the products supplied under the relevant order.",
        },
        {
          type: "paragraph",
          text: "ClearPiece shall not be liable for indirect, incidental, consequential, or business interruption losses.",
        },
      ],
    },
    {
      id: "force-majeure",
      title: "14. Force Majeure",
      blocks: [
        {
          type: "paragraph",
          text: "ClearPiece shall not be liable for delays or inability to perform obligations due to circumstances beyond reasonable control including:",
        },
        {
          type: "unordered_list",
          items: [
            "Natural disasters",
            "Government restrictions",
            "Strikes",
            "Labor shortages",
            "Transportation disruptions",
            "Pandemics",
            "War",
            "Civil disturbances",
          ],
        },
      ],
    },
    {
      id: "governing-law",
      title: "15. Governing Law",
      blocks: [
        {
          type: "paragraph",
          text: "These Terms shall be governed by the laws of India.",
        },
        {
          type: "paragraph",
          text: "Any disputes shall be subject exclusively to the jurisdiction of courts located in Firozabad, Uttar Pradesh.",
        },
      ],
    },
  ],
};

export const shippingPolicyDocument: PolicyDocument = {
  title: "Shipping, Breakage & Return Policy",
  sections: [
    {
      id: "production-timelines",
      title: "1. Production Timelines",
      blocks: [
        { type: "paragraph", text: "Production timelines provided by ClearPiece are estimates only." },
        { type: "paragraph", text: "Actual timelines may vary depending on:" },
        {
          type: "unordered_list",
          items: [
            "Quantity",
            "Customization",
            "Printing requirements",
            "Material availability",
            "Approval delays",
            "Logistics conditions",
          ],
        },
      ],
    },
    {
      id: "dispatch-delivery",
      title: "2. Dispatch & Delivery",
      blocks: [
        {
          type: "paragraph",
          text: "Products are dispatched through third-party logistics providers.",
        },
        { type: "paragraph", text: "Estimated delivery dates are indicative and not guaranteed." },
        {
          type: "paragraph",
          text: "ClearPiece shall not be responsible for delays caused by transporters, weather conditions, customs procedures, strikes, or other external factors.",
        },
      ],
    },
    {
      id: "transfer-of-risk",
      title: "3. Transfer of Risk",
      blocks: [
        {
          type: "paragraph",
          text: "Risk and responsibility for goods transfer to the customer immediately upon handover to the transporter or logistics provider.",
        },
      ],
    },
    {
      id: "freight-charges",
      title: "4. Freight Charges",
      blocks: [
        {
          type: "paragraph",
          text: "Freight charges are additional unless specifically included in writing.",
        },
        {
          type: "paragraph",
          text: "Quoted freight charges are estimates and may vary based on:",
        },
        {
          type: "unordered_list",
          items: ["Destination", "Fuel costs", "Volumetric weight", "Transportation conditions"],
        },
      ],
    },
    {
      id: "breakage-claims",
      title: "5. Breakage Claims",
      blocks: [
        {
          type: "paragraph",
          text: "Breakage claims must be reported within 48 hours of delivery.",
        },
        { type: "paragraph", text: "Claims must include:" },
        {
          type: "unordered_list",
          items: ["Unboxing video", "Package photographs", "Product photographs", "Invoice reference"],
        },
        { type: "paragraph", text: "Claims received after 48 hours may not be accepted." },
      ],
    },
    {
      id: "inspection-of-goods",
      title: "6. Inspection of Goods",
      blocks: [
        {
          type: "paragraph",
          text: "Customers must inspect products immediately upon receipt.",
        },
        {
          type: "paragraph",
          text: "Any shortages, damages, or discrepancies must be communicated within 48 hours.",
        },
        { type: "paragraph", text: "Use of products shall constitute acceptance of goods." },
      ],
    },
    {
      id: "returns",
      title: "7. Returns",
      blocks: [
        {
          type: "paragraph",
          text: "Due to the customized and made-to-order nature of our products:",
        },
        {
          type: "unordered_list",
          items: [
            "Customized products are non-returnable.",
            "Printed products are non-returnable.",
            "Approved production orders are non-cancellable.",
          ],
        },
        {
          type: "paragraph",
          text: "Returns may only be accepted if expressly approved in writing by ClearPiece.",
        },
      ],
    },
    {
      id: "refunds",
      title: "8. Refunds",
      blocks: [
        {
          type: "paragraph",
          text: "Refunds, if approved, shall be processed within a reasonable period after verification and approval.",
        },
        {
          type: "paragraph",
          text: "Development charges, tooling charges, screen charges, freight charges, and customization charges remain non-refundable.",
        },
      ],
    },
  ],
};

export const privacyPolicyDocument: PolicyDocument = {
  title: "Privacy Policy",
  sections: [
    {
      id: "information-we-collect",
      title: "1. Information We Collect",
      blocks: [
        { type: "paragraph", text: "We may collect:" },
        {
          type: "unordered_list",
          items: [
            "Name",
            "Company name",
            "Email address",
            "Phone number",
            "GST information",
            "Shipping address",
            "Billing address",
            "Website activity information",
          ],
        },
      ],
    },
    {
      id: "purpose-of-collection",
      title: "2. Purpose of Collection",
      blocks: [
        { type: "paragraph", text: "Information may be used for:" },
        {
          type: "unordered_list",
          items: [
            "Processing enquiries",
            "Providing quotations",
            "Managing orders",
            "Customer support",
            "Marketing communications",
            "Product updates",
            "Service improvements",
          ],
        },
      ],
    },
    {
      id: "information-sharing",
      title: "3. Information Sharing",
      blocks: [
        { type: "paragraph", text: "ClearPiece does not sell customer information." },
        { type: "paragraph", text: "Information may be shared only with:" },
        {
          type: "unordered_list",
          items: [
            "Logistics partners",
            "Payment processors",
            "Government authorities where legally required",
            "Professional advisors and service providers",
          ],
        },
      ],
    },
    {
      id: "data-security",
      title: "4. Data Security",
      blocks: [
        {
          type: "paragraph",
          text: "Reasonable security measures are implemented to protect customer information from unauthorized access, disclosure, or misuse.",
        },
        {
          type: "paragraph",
          text: "However, no electronic transmission or storage method can be guaranteed as completely secure.",
        },
      ],
    },
    {
      id: "marketing-communication",
      title: "5. Marketing Communication",
      blocks: [
        {
          type: "paragraph",
          text: "By submitting information through our website or forms, customers may receive:",
        },
        {
          type: "unordered_list",
          items: [
            "Product updates",
            "Promotional offers",
            "Service announcements",
            "Business communications",
          ],
        },
        { type: "paragraph", text: "Customers may opt out at any time." },
      ],
    },
    {
      id: "cookies",
      title: "6. Cookies",
      blocks: [
        {
          type: "paragraph",
          text: "Our website may use cookies and analytics tools to improve functionality, user experience, and website performance.",
        },
        {
          type: "paragraph",
          text: "Users may disable cookies through browser settings.",
        },
      ],
    },
    {
      id: "third-party-links",
      title: "7. Third-Party Links",
      blocks: [
        {
          type: "paragraph",
          text: "The website may contain links to third-party websites.",
        },
        {
          type: "paragraph",
          text: "ClearPiece is not responsible for the privacy practices or content of such websites.",
        },
      ],
    },
    {
      id: "contact",
      title: "8. Contact",
      blocks: [
        { type: "paragraph", text: "For any privacy-related concerns, users may contact:" },
        {
          type: "unordered_list",
          items: [
            "ClearPiece",
            "hello@clearpiece.in (replace with actual email)",
            "+91-XXXXXXXXXX",
            "www.clearpiece.in",
          ],
        },
      ],
    },
  ],
};
