---
enable: true
title: "Flexible Engagement **Models**"
description: "Choose the engagement model that fits your needs — from fixed-scope projects <br /> to dedicated teams and ongoing managed services."

pricingComparisonTitle: ""
pricingComparisonTogglerLabel: "Select preferred engagement type"

plans:
  enable: true
  list:
    - selected: true
      label: Per Project
    - selected: false
      label: Retainer

list:
  # Starter Package
  - enable: true
    icon: "/images/icons/svg/crown.svg"
    featured: false
    featuresLabel: "What's Included:"
    badge:
      enable: false
      label: "New"
      variant: "new"
    name: Starter
    description: Ideal for small businesses & focused projects

    price:
      - type: Per Project
        typeAlternateValue: "Starting from, per project"
        prependValue: $
        value: 5,000
        appendValue:
      - type: Retainer
        typeAlternateValue: "Per month, billed quarterly"
        prependValue: $
        value: 2,500
        appendValue: /mo

    button:
      enable: true
      label: Get a Quote
      url: /contact/
      rel:
      target:
      variant: "outline"
      hoverEffect: "text-flip"

  # Professional Package
  - enable: true
    icon: "/images/icons/svg/crown.svg"
    featured: true
    featuresLabel: "What's Included:"
    badge:
      enable: true
      label: "Most Popular"
      variant: "popular"
    name: Professional
    description: For mid-size businesses needing full ERP & integrations

    price:
      - type: Per Project
        typeAlternateValue: "Starting from, per project"
        prependValue: $
        value: 25,000
        appendValue:
      - type: Retainer
        typeAlternateValue: "Per month, billed quarterly"
        prependValue: $
        value: 8,000
        appendValue: /mo

    button:
      enable: true
      label: Schedule a Consultation
      url: /contact/
      rel:
      target:
      variant: "fill"
      hoverEffect: "text-flip"

  # Enterprise Package
  - enable: true
    icon: "/images/icons/svg/crown.svg"
    featured: false
    featuresLabel: "What's Included:"
    badge:
      enable: false
      label: "Recommended"
      variant: "recommended"
    name: Enterprise
    description: For large organizations with complex requirements

    price:
      - type: Per Project
        typeAlternateValue: "Custom scoping & pricing"
        prependValue: ""
        value: Custom
        appendValue:
      - type: Retainer
        typeAlternateValue: "Dedicated team, billed monthly"
        prependValue: ""
        value: Custom
        appendValue:

    button:
      enable: true
      label: Contact Sales
      url: /contact/
      rel:
      target:
      variant: "outline"
      hoverEffect: "text-flip"

# Pricing Comparison & Features
comparison:
  - label: Implementation Services
    popover:
      enable: true
      title: "Implementation Services"
      description: "End-to-end ERP implementation including analysis, configuration, data migration, training, and go-live support."
    list:
      - value: Business Analysis
        showInCard: true
        included:
          - "Basic assessment"
          - "Full process mapping"
          - "Enterprise assessment"
      - value: Module Configuration
        showInCard: true
        popover:
          enable: true
          title: "Module Configuration"
          description: "Setup and configuration of Odoo modules tailored to your business processes."
        included:
          - "Up to 3 modules"
          - "Up to 10 modules"
          - "Unlimited modules"
      - value: Data Migration
        showInCard: false
        included:
          - "Basic import"
          - "Full migration"
          - "Complex multi-system migration"
      - value: User Training
        showInCard: false
        included:
          - "Online documentation"
          - "Live training sessions"
          - "Dedicated training program"

  - label: Customization & Development
    popover:
      enable: true
      title: "Customization & Development"
      description: "Custom Odoo modules, workflow automation, and bespoke software development tailored to your business."
    list:
      - value: Custom Workflows
        showInCard: true
        included:
          - true
          - true
          - true
      - value: Custom Module Development
        showInCard: true
        included:
          - false
          - true
          - true
      - value: API & Third-Party Integrations
        showInCard: false
        included:
          - false
          - true
          - true
      - value: AI & Automation Features
        showInCard: false
        included:
          - false
          - false
          - true

  - label: Support & Maintenance
    popover:
      enable: true
      title: "Support & Maintenance"
      description: "Ongoing support, maintenance, and optimization to keep your systems running at peak performance."
    list:
      - value: Email Support
        showInCard: true
        included:
          - "48h response"
          - "8h response"
          - "2h response"
      - value: Phone & Chat Support
        showInCard: false
        included:
          - false
          - "Business hours"
          - "24/7 priority"
      - value: Dedicated Account Manager
        showInCard: false
        included:
          - false
          - false
          - true
      - value: Proactive Monitoring
        showInCard: false
        included:
          - false
          - false
          - true
      - value: SLA Guarantee
        showInCard: false
        included:
          - false
          - false
          - "99.9% uptime"
      - value: Security & Compliance (ISO)
        showInCard: false
        included:
          - false
          - true
          - true

  - label: Strategic Services
    popover:
      enable: false
      title: ""
      description: ""
    list:
      - value: Technology Roadmap
        showInCard: false
        included:
          - false
          - "Annual review"
          - "Quarterly strategic reviews"
      - value: Performance Optimization
        showInCard: false
        included:
          - false
          - false
          - true
      - value: Executive Reporting & Analytics
        showInCard: false
        included:
          - false
          - "Standard dashboards"
          - "Custom executive dashboards"
---
