export const supportContacts = {
  phoneLabel: "+91 98765 43210",
  phoneHref: "tel:+919876543210",
  emailLabel: "care@glaway.in",
  emailHref: "mailto:care@glaway.in",
  address: "Main University Canteen, Student Center, GLA Campus",
  hours: "Daily, 8:00 AM to 10:00 PM"
};

export const socialLinks = [
  {
    label: "Instagram",
    handle: "@glaway.campus",
    href: "https://instagram.com/glaway.campus"
  },
  {
    label: "X",
    handle: "@glawaycampus",
    href: "https://x.com/glawaycampus"
  },
  {
    label: "LinkedIn",
    handle: "GLAWay Campus",
    href: "https://www.linkedin.com/company/glaway-campus"
  },
  {
    label: "YouTube",
    handle: "GLAWay Live",
    href: "https://www.youtube.com/@glawaylive"
  }
];

export const policySections = [
  {
    title: "Privacy and account safety",
    description:
      "We only collect the details required to authenticate users, process orders, and support campus pickup.",
    items: [
      "Student profile data is used for login, order identification, and customer care support.",
      "Payment verification data is stored only to confirm transaction success and resolve disputes.",
      "Admin access is restricted to verified canteen staff accounts protected with JWT sessions."
    ]
  },
  {
    title: "Ordering and pickup policy",
    description:
      "Orders are prepared for campus pickup and should be collected using the issued QR code or pickup token.",
    items: [
      "Customers should verify item quantity before leaving the pickup counter.",
      "Ready orders are held for a limited time during operating hours before staff may mark them missed.",
      "Order status estimates are approximate and may change during rush periods."
    ]
  },
  {
    title: "Refund and issue resolution",
    description:
      "We aim to resolve food quality, payment, and wrong-order issues quickly through customer care.",
    items: [
      "Payment failures without confirmed order creation should be escalated through customer care with the transaction reference.",
      "Incorrect or incomplete orders should be reported within the same day for prompt review.",
      "Refund decisions are handled by campus canteen staff based on payment confirmation and order history."
    ]
  },
  {
    title: "Feedback and community standards",
    description:
      "Constructive feedback helps improve menu quality, delivery speed, and the campus ordering experience.",
    items: [
      "Abusive or fraudulent reports may be rejected after review.",
      "Feature suggestions and service complaints are both welcome through the feedback form.",
      "Support channels should be used respectfully so staff can help students faster."
    ]
  }
];

export const feedbackTopics = [
  "Food Quality",
  "Order Delay",
  "Payment Experience",
  "App Experience",
  "Customer Care",
  "Feature Request"
];

export const careHighlights = [
  {
    title: "Fast issue handling",
    text: "Payment and pickup issues are prioritized during live service windows."
  },
  {
    title: "Campus-first support",
    text: "Support is tuned for student peak hours, rush breaks, and admin escalations."
  },
  {
    title: "Order-aware resolution",
    text: "Share your order ID to help the team trace tokens, payments, and prep flow quickly."
  }
];

export const customerCareFaqs = [
  {
    question: "What should I do if payment is debited but my order does not appear?",
    answer:
      "Reach out through customer care or feedback with your payment reference. The team can cross-check payment verification and order creation."
  },
  {
    question: "How long should I wait after my order shows Ready?",
    answer:
      "Please collect the order as soon as possible. Pickup counters may only hold ready orders for a limited period during busy service slots."
  },
  {
    question: "Can I report a food quality issue later in the day?",
    answer:
      "Yes, but same-day reporting helps staff inspect the issue while order details and preparation context are still fresh."
  },
  {
    question: "Where can I request a new feature or canteen addition?",
    answer:
      "Use the feedback form and select Feature Request or App Experience so the product and operations teams can review it."
  }
];
