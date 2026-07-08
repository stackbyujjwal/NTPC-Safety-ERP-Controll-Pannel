/**
 * NTPC SAFETY ERP MANAGEMENT SYSTEM
 * Enterprise Constants & System Configuration
 */

export const getSmartDateMemory = (inputDate = new Date()) => {
    const d = typeof inputDate === 'string' ? new Date(inputDate) : (inputDate instanceof Date ? inputDate : new Date());
    if (isNaN(d.getTime())) return { fy: "2026-2027", month: "July", year: 2026 };
    const year = d.getFullYear();
    const mIdx = d.getMonth(); // 0 is Jan, 3 is Apr
    const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    const month = months[mIdx];
    const fy = mIdx >= 3 ? `${year}-${year + 1}` : `${year - 1}-${year}`;
    return { fy, month, year };
};

const _currentMemory = getSmartDateMemory();

export const APP_CONFIG = {
    APP_NAME: "NTPC Safety Portal",
    FULL_NAME: "NTPC Safety & Fire Services Management System",
    VERSION: "v4.8.0",
    DEVELOPER: "Safety Systems Group",
    COMPANY: "NTPC Limited",
    YEAR: _currentMemory.year,
    DEFAULT_FY: _currentMemory.fy,
    DEFAULT_MONTH: _currentMemory.month
};

export const THEME_COLORS = {
    PRIMARY: "#0A2647",
    SECONDARY: "#144272",
    ACCENT: "#2C74B3",
    SUCCESS: "#2E7D32",
    WARNING: "#F9A825",
    DANGER: "#C62828",
    BACKGROUND: "#F5F7FA",
    SIDEBAR: "#081B33",
    CARDS: "#FFFFFF",
    TABLES: "#F8F9FA",
    BUTTONS: "#2C74B3"
};

export const FINANCIAL_YEARS = [
    "2024-2025",
    "2025-2026",
    "2026-2027",
    "2027-2028",
    "2028-2029",
    "2029-2030",
    "2030-2031",
    "2031-2032",
    "2032-2033",
    "2033-2034",
    "2034-2035",
    "2035-2036",
    "2036-2037",
    "2037-2038",
    "2038-2039",
    "2039-2040",
    "2040-2041",
    "2041-2042",
    "2042-2043",
    "2043-2044",
    "2044-2045",
    "2045-2046",
    "2046-2047",
    "2047-2048",
    "2048-2049",
    "2049-2050"
];

export const MONTHS = [
    { name: "April", order: 1, quarter: "Q1" },
    { name: "May", order: 2, quarter: "Q1" },
    { name: "June", order: 3, quarter: "Q1" },
    { name: "July", order: 4, quarter: "Q2" },
    { name: "August", order: 5, quarter: "Q2" },
    { name: "September", order: 6, quarter: "Q2" },
    { name: "October", order: 7, quarter: "Q3" },
    { name: "November", order: 8, quarter: "Q3" },
    { name: "December", order: 9, quarter: "Q3" },
    { name: "January", order: 10, quarter: "Q4" },
    { name: "February", order: 11, quarter: "Q4" },
    { name: "March", order: 12, quarter: "Q4" }
];

export const PLANT_AREAS = [
    { id: "main_plant", name: "Main Plant", code: "MP" },
    { id: "chp", name: "CHP (Coal Handling Plant)", code: "CHP" },
    { id: "switchyard", name: "Switchyard & Electrical", code: "SWY" }
];

export const DEPARTMENTS = [
    "Mechanical Maintenance",
    "Electrical Maintenance",
    "Control & Instrumentation (C&I)",
    "Operations",
    "Coal Handling Plant (CHP)",
    "Ash Handling Plant (AHP)",
    "Civil Engineering",
    "Safety & Fire Services",
    "Chemical & Lab",
    "IT & ERP Systems"
];

export const INSPECTION_CATEGORIES = [
    {
        id: "hand_tool",
        name: "Hand Tool Inspection",
        frequency: "Monthly",
        areas: ["Main Plant", "CHP", "Switchyard"],
        checklist: [
            "Handle condition (no cracks, splinters or burrs)",
            "Head/blade security and wedging",
            "No mushrooming on chisels or impact tools",
            "Proper insulation on insulated electrical hand tools",
            "Color coding tag updated for current month"
        ]
    },
    {
        id: "power_tool",
        name: "Power Tool Inspection",
        frequency: "Monthly",
        areas: ["Main Plant", "CHP", "Switchyard"],
        checklist: [
            "Power cord and plug integrity (no exposed copper or cuts)",
            "Dead-man switch / trigger mechanism functioning properly",
            "Wheel guard attached and properly positioned",
            "RPM rating on abrasive disc matches or exceeds machine speed",
            "Double insulation or valid grounding verified"
        ]
    },
    {
        id: "extension_board",
        name: "Extension Board Inspection",
        frequency: "Monthly",
        areas: ["Main Plant", "CHP", "Switchyard"],
        checklist: [
            "Heavy-duty industrial metallic/polycarbonate weatherproof enclosure",
            "3-pin industrial top and socket fitment without looseness",
            "Integrated MCB/ELCB rated at 30mA tripping sensitivity tested",
            "Cable gland tightening and strain relief secure",
            "No temporary wire twisting or jointing inside board"
        ]
    },
    {
        id: "ladder",
        name: "Ladder Inspection",
        frequency: "Monthly",
        areas: ["Main Plant", "CHP", "Switchyard"],
        checklist: [
            "Side rails straight without twists, dents or corrosion",
            "Rungs clean, firmly attached and anti-skid grooves intact",
            "Safety rubber feet / non-slip shoes present and firmly seated",
            "Spreader assembly and locking mechanism secure on step ladders",
            "Safe Working Load (SWL) and inspection tag visibly affixed"
        ]
    },
    {
        id: "rccb_plant",
        name: "RCCB Inspection - Plant Area",
        frequency: "Monthly",
        areas: ["Main Plant", "CHP", "Switchyard"],
        checklist: [
            "Physical test button push operates tripping instantly",
            "Trip time measured < 30 milliseconds using RCCB calibrator",
            "Earth fault loop impedance within acceptable threshold (< 1 Ohm)",
            "Enclosure IP55 dust/water protection seal intact",
            "Monthly calibration sticker updated by Electrical Safety Officer"
        ]
    },
    {
        id: "rccb_contractor",
        name: "RCCB Inspection - Contractor Area",
        frequency: "Monthly",
        areas: ["Main Plant", "CHP", "Switchyard"],
        checklist: [
            "Mandatory 30mA sensitivity RCCB installed on all distribution boards",
            "Dedicated earthing pit connected to distribution box earth bus",
            "No bypass or direct looping across RCCB input/output terminals",
            "Contractor authorized electrician license verified on site board",
            "Monthly safety pass tag issued and displayed"
        ]
    },
    {
        id: "ppe",
        name: "PPE Compliance Inspection",
        frequency: "Quarterly",
        allowedMonths: ["April", "July", "October", "January"],
        areas: ["Main Plant", "CHP", "Switchyard"],
        checklist: [
            "Safety Helmets IS 2925 / EN 397 with chin strap inside validity (5 yrs)",
            "Steel toe safety shoes IS 15298 condition and sole tread depth",
            "Full body harness with double lanyard and shock absorber certified",
            "Eye & ear protection available at designated high noise/grinding areas",
            "Specialized PPE (ARC flash suit, chemical apron) stored properly"
        ]
    },
    {
        id: "welding_machine",
        name: "Welding Machine Inspection",
        frequency: "Quarterly",
        allowedMonths: ["April", "July", "October", "January"],
        areas: ["Main Plant", "CHP", "Switchyard"],
        checklist: [
            "Open Circuit Voltage (OCV) reducing device / VRD functional (<24V)",
            "Welding return cable (earth) clamped directly to workpiece with brass clamp",
            "Electrode holder fully insulated without cracked outer jaws",
            "Dedicated fire extinguisher (CO2/DCP) stationed within 5 meters"
        ]
    },
    {
        id: "incident_recall_w1",
        name: "Incident Recall W1",
        frequency: "Monthly",
        areas: ["All"],
        checklist: ["Review site incidents from previous week", "Disseminate findings to working crew", "Verify corrective actions on floor"]
    },
    {
        id: "incident_recall_w2",
        name: "Incident Recall W2",
        frequency: "Monthly",
        areas: ["All"],
        checklist: ["Review site incidents from previous week", "Disseminate findings to working crew", "Verify corrective actions on floor"]
    },
    {
        id: "incident_recall_w3",
        name: "Incident Recall W3",
        frequency: "Monthly",
        areas: ["All"],
        checklist: ["Review site incidents from previous week", "Disseminate findings to working crew", "Verify corrective actions on floor"]
    },
    {
        id: "incident_recall_w4",
        name: "Incident Recall W4",
        frequency: "Monthly",
        areas: ["All"],
        checklist: ["Review site incidents from previous week", "Disseminate findings to working crew", "Verify corrective actions on floor"]
    },
    {
        id: "module_training_w1",
        name: "Module Training W1",
        frequency: "Monthly",
        areas: ["All"],
        checklist: ["Safety module presentation delivered", "Evaluation assessment conducted", "Training attendance updated"]
    },
    {
        id: "module_training_w2",
        name: "Module Training W2",
        frequency: "Monthly",
        areas: ["All"],
        checklist: ["Safety module presentation delivered", "Evaluation assessment conducted", "Training attendance updated"]
    },
    {
        id: "module_training_w3",
        name: "Module Training W3",
        frequency: "Monthly",
        areas: ["All"],
        checklist: ["Safety module presentation delivered", "Evaluation assessment conducted", "Training attendance updated"]
    },
    {
        id: "module_training_w4",
        name: "Module Training W4",
        frequency: "Monthly",
        areas: ["All"],
        checklist: ["Safety module presentation delivered", "Evaluation assessment conducted", "Training attendance updated"]
    }
];

export const STATUS_OPTIONS = [
    { id: "Completed", label: "Completed", badgeClass: "badge-success" },
    { id: "Pending", label: "Pending Action", badgeClass: "badge-warning" },
    { id: "Overdue", label: "Overdue", badgeClass: "badge-danger" }
];

export const USER_ROLES = {
    ADMIN: { id: "admin", name: "System Administrator", permissions: ["all"] },
    SAFETY_OFFICER: { id: "safety_officer", name: "Safety Engineer / Officer", permissions: ["read", "write", "approve"] },
    VIEWER: { id: "viewer", name: "Plant Executive (Read Only)", permissions: ["read"] }
};
