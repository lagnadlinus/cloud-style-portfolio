/*
  Fully static interaction layer.
  The UI uses predefined content panels, safe text insertion, and no external dependencies.
*/

document.addEventListener("DOMContentLoaded", () => {
  const body = document.body;
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const menuToggle = document.getElementById("menuToggle");
  const explorerClose = document.getElementById("explorerClose");
  const explorerPanel = document.getElementById("explorerPanel");
  const windowCloseControl = document.getElementById("windowCloseControl");
  const windowMinimizeControl = document.getElementById("windowMinimizeControl");
  const windowMaximizeControl = document.getElementById("windowMaximizeControl");
  const fileButtons = Array.from(document.querySelectorAll(".file-item"));
  const terminalFab = document.getElementById("terminalFab");
  const windowOverlay = document.getElementById("windowOverlay");
  const closeWindow = document.getElementById("closeWindow");
  const backToTerminal = document.getElementById("backToTerminal");
  const windowTitle = document.getElementById("windowTitle");
  const windowIcon = document.getElementById("windowIcon");
  const footerFileName = document.getElementById("footerFileName");
  const contentPanels = Array.from(document.querySelectorAll(".content-panel"));
  const terminalOutput = document.getElementById("terminalOutput");
  const terminalButtons = Array.from(document.querySelectorAll(".terminal-chip"));
  const windowSwitchButtons = Array.from(document.querySelectorAll(".window-switch-button"));
  const windowSwitcher = document.querySelector(".window-switcher");
  const terminalForm = document.getElementById("terminalForm");
  const terminalInput = document.getElementById("terminalInput");
  const particleField = document.getElementById("particleField");
  const clockChip = document.getElementById("clockChip");
  const backgroundSystem = document.querySelector(".background-system");
  const terminalHistory = [];
  let awsQuizState = null;
  let backTargetPanel = "";
  let historyIndex = -1;

  const fileMeta = {
    about: { title: "about.md", icon: "○" },
    skills: { title: "skills.json", icon: "□" },
    projects: { title: "projects.yaml", icon: "◇" },
    certifications: { title: "certs.log", icon: "△" },
    contact: { title: "contact.sh", icon: "↗" },
    terminal: { title: "terminal.exe", icon: ">_" }
  };

  const commandAliases = {
    certificates: "certs",
    certification: "certs",
    certifications: "certs",
    project: "projects",
    skill: "skills",
    cls: "clear",
    linkedin: "contact",
    github: "contact",
    "ls -la": "ls",
    "uname -a": "uname",
    "cat profile.jpg": "file profile.jpg"
  };

  const terminalData = {
    help: [
      "available commands:",
      "  help, ls, tree, pwd, whoami, hostname, uname, date, clear",
      "  about, skills, projects, certs, contact, cloud, aws-quiz",
      "  ping jakarta-cdn, ping oss-origin, speedcheck, status",
      "  quiz controls: aws-quiz, a/b/c/d, next, quit",
      "  cat about.md, cat skills.json, cat projects.yaml, cat certs.log, cat contact.sh"
    ],
    ls: [
      "about.md",
      "skills.json",
      "projects.yaml",
      "certs.log",
      "contact.sh",
      "terminal.exe",
      "profile.jpg"
    ],
    tree: [
      ".",
      "|-- about.md",
      "|-- skills.json",
      "|-- projects.yaml",
      "|-- certs.log",
      "|-- contact.sh",
      "|-- terminal.exe",
      "`-- profile.jpg"
    ],
    pwd: [
      "/srv/portfolio/static"
    ],
    whoami: [
      "visitor"
    ],
    hostname: [
      "sunildangal-portfolio"
    ],
    uname: [
      "Linux portfolio-host 6.1.0-static x86_64 zsh"
    ],
    date: [],
    status: [
      "origin: alibaba cloud oss bucket",
      "region: indonesia (jakarta)",
      "delivery: static website hosting",
      "routing: custom domain -> browser delivery",
      "mode: dark architecture portfolio"
    ],
    cloud: [
      "custom domain -> dns -> cdn edge -> oss origin -> static assets",
      "static assets: index.html, style.css, script.js, profile.jpg",
      "deployment target: indonesia (jakarta)"
    ],
    speedcheck: [
      "running edge delivery check...",
      "latency: 42ms",
      "download estimate: 84.3 Mbps",
      "upload estimate: 19.7 Mbps",
      "cdn status: healthy"
    ],
    "ping jakarta-cdn": [
      "PING jakarta-cdn (103.1.2.10): 56 data bytes",
      "64 bytes from jakarta-cdn: icmp_seq=0 ttl=56 time=41.2 ms",
      "64 bytes from jakarta-cdn: icmp_seq=1 ttl=56 time=39.8 ms",
      "64 bytes from jakarta-cdn: icmp_seq=2 ttl=56 time=42.0 ms",
      "--- jakarta-cdn ping statistics ---",
      "3 packets transmitted, 3 packets received, 0.0% packet loss"
    ],
    "ping oss-origin": [
      "PING oss-origin (47.74.22.10): 56 data bytes",
      "64 bytes from oss-origin: icmp_seq=0 ttl=51 time=78.6 ms",
      "64 bytes from oss-origin: icmp_seq=1 ttl=51 time=75.3 ms",
      "64 bytes from oss-origin: icmp_seq=2 ttl=51 time=79.1 ms",
      "--- oss-origin ping statistics ---",
      "3 packets transmitted, 3 packets received, 0.0% packet loss"
    ],
    "file profile.jpg": [
      "profile.jpg: JPEG image data, baseline, portrait asset"
    ],
    clear: []
  };

  const awsQuizQuestions = [
    {
      question: "Which AWS service lets you distribute traffic globally with Anycast and static IP addresses?",
      choices: ["Route 53", "Global Accelerator", "CloudFront", "Elastic Load Balancing"],
      answer: "b",
      explanation: "Global Accelerator uses Anycast IPs and the AWS global network to improve availability and performance."
    },
    {
      question: "Which storage class is best for long-term archive with retrieval times of minutes to hours?",
      choices: ["S3 Standard", "S3 Intelligent-Tiering", "S3 Glacier Flexible Retrieval", "EFS Standard"],
      answer: "c",
      explanation: "S3 Glacier Flexible Retrieval is intended for archival data with slower, lower-cost retrieval."
    },
    {
      question: "Which service should you use for a managed relational database with automatic backups and Multi-AZ options?",
      choices: ["Amazon RDS", "Amazon DynamoDB", "Amazon Redshift", "Amazon ElastiCache"],
      answer: "a",
      explanation: "Amazon RDS is the managed relational database service with Multi-AZ and backup support."
    },
    {
      question: "What is the most cost-effective EC2 pricing option for fault-tolerant, flexible workloads?",
      choices: ["Dedicated Hosts", "Spot Instances", "On-Demand Instances", "Reserved Instances"],
      answer: "b",
      explanation: "Spot Instances are usually the cheapest when the workload can tolerate interruption."
    },
    {
      question: "Which AWS service provides a serverless way to run code in response to events?",
      choices: ["Amazon ECS", "AWS Lambda", "AWS Batch", "Amazon EC2 Auto Scaling"],
      answer: "b",
      explanation: "AWS Lambda runs event-driven code without managing servers."
    },
    {
      question: "Which AWS service is used to create a logically isolated section of the cloud?",
      choices: ["Route 53 Hosted Zone", "VPC", "Transit Gateway", "Direct Connect"],
      answer: "b",
      explanation: "A VPC is the core networking boundary for isolated AWS resources."
    },
    {
      question: "Which service should be used to centrally manage encryption keys?",
      choices: ["AWS Shield", "AWS KMS", "AWS WAF", "Secrets Manager"],
      answer: "b",
      explanation: "AWS KMS is used for creating and managing encryption keys."
    },
    {
      question: "Which Route 53 routing policy is best for directing users to the lowest-latency endpoint?",
      choices: ["Weighted", "Failover", "Latency", "Geolocation"],
      answer: "c",
      explanation: "Latency routing sends users to the region with the best latency."
    },
    {
      question: "Which service is best for shared file storage mounted concurrently across Linux EC2 instances?",
      choices: ["Amazon EBS", "Amazon EFS", "S3 Glacier", "Instance Store"],
      answer: "b",
      explanation: "Amazon EFS provides shared, elastic NFS storage for Linux workloads."
    },
    {
      question: "Which AWS service helps protect against DDoS attacks automatically at the basic level?",
      choices: ["AWS Shield Standard", "Amazon Inspector", "Security Hub", "GuardDuty"],
      answer: "a",
      explanation: "Shield Standard is included automatically and protects against common DDoS attacks."
    },
    {
      question: "Which service should you use for point-in-time recovery on a NoSQL key-value database?",
      choices: ["Amazon Aurora", "Amazon DynamoDB", "Amazon EMR", "Amazon Neptune"],
      answer: "b",
      explanation: "DynamoDB supports point-in-time recovery for NoSQL workloads."
    },
    {
      question: "Which AWS service provides a content delivery network?",
      choices: ["CloudFront", "API Gateway", "Global Accelerator", "Lightsail"],
      answer: "a",
      explanation: "CloudFront is AWS's CDN service."
    },
    {
      question: "Which service is best for storing application secrets such as database passwords with rotation support?",
      choices: ["Systems Manager Parameter Store only", "AWS KMS", "AWS Secrets Manager", "IAM Access Analyzer"],
      answer: "c",
      explanation: "Secrets Manager is purpose-built for secrets storage and rotation."
    },
    {
      question: "Which design principle improves resilience by running workloads across multiple Availability Zones?",
      choices: ["Vertical scaling", "Loose coupling", "High availability", "Data gravity"],
      answer: "c",
      explanation: "Multi-AZ architecture is a standard high-availability design pattern."
    },
    {
      question: "Which service gives near-real-time visibility into malicious activity and unusual API behavior?",
      choices: ["GuardDuty", "Macie", "Artifact", "CloudHSM"],
      answer: "a",
      explanation: "GuardDuty analyzes logs and events to detect suspicious activity."
    },
    {
      question: "Which service can connect multiple VPCs and on-premises networks through a central hub?",
      choices: ["VPC Peering", "Transit Gateway", "NAT Gateway", "PrivateLink"],
      answer: "b",
      explanation: "Transit Gateway is designed as a scalable central network hub."
    },
    {
      question: "Which AWS service is best for decoupling application components with a message queue?",
      choices: ["Amazon SNS", "Amazon SQS", "Amazon MQ only", "AWS Step Functions"],
      answer: "b",
      explanation: "Amazon SQS is the standard managed queue for decoupling components."
    },
    {
      question: "Which service provides infrastructure as code using declarative templates?",
      choices: ["CloudFormation", "CodeDeploy", "Config", "CloudTrail"],
      answer: "a",
      explanation: "CloudFormation lets you define and provision infrastructure as code."
    },
    {
      question: "Which service provides dedicated private network connectivity from on-premises to AWS?",
      choices: ["VPN", "Transit Gateway", "Direct Connect", "PrivateLink"],
      answer: "c",
      explanation: "Direct Connect provides dedicated private connectivity into AWS."
    },
    {
      question: "Which billing model reduces cost when you commit to steady compute usage over one or three years?",
      choices: ["Savings Plans", "Spot Fleet", "Auto Scaling", "Dedicated Instances"],
      answer: "a",
      explanation: "Savings Plans discount predictable long-term compute usage."
    }
  ];

  const panelCommandMap = {
    about: "about",
    "about.md": "about",
    skills: "skills",
    "skills.json": "skills",
    projects: "projects",
    "projects.yaml": "projects",
    certs: "certifications",
    certifications: "certifications",
    "certs.log": "certifications",
    contact: "contact",
    "contact.sh": "contact"
  };

  function normalizeCommand(value) {
    const trimmed = value.trim().toLowerCase();
    return commandAliases[trimmed] || trimmed;
  }

  function focusTerminalInput() {
    if (terminalInput) {
      window.setTimeout(() => terminalInput.focus(), 30);
    }
  }

  function updateClock() {
    const now = new Date();
    const viewerTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const timeFormatter = new Intl.DateTimeFormat([], {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
      timeZone: viewerTimeZone
    });
    const zoneFormatter = new Intl.DateTimeFormat([], {
      timeZone: viewerTimeZone,
      timeZoneName: "short"
    });
    const zoneParts = zoneFormatter.formatToParts(now);
    const zoneName = zoneParts.find((part) => part.type === "timeZoneName")?.value || viewerTimeZone;

    clockChip.textContent = `${timeFormatter.format(now)} ${zoneName}`;
  }

  function createParticles() {
    if (prefersReducedMotion || !particleField) {
      return;
    }

    const count = window.innerWidth < 768 ? 14 : 24;

    for (let index = 0; index < count; index += 1) {
      const particle = document.createElement("span");
      particle.className = "particle";
      particle.style.left = `${Math.random() * 100}%`;
      particle.style.top = `${18 + Math.random() * 72}%`;
      particle.style.animationDuration = `${7 + Math.random() * 8}s`;
      particle.style.animationDelay = `${Math.random() * 6}s`;
      particle.style.opacity = `${0.18 + Math.random() * 0.36}`;
      particleField.appendChild(particle);
    }
  }

  function spawnCyberTrail(x, y) {
    if (prefersReducedMotion || !backgroundSystem) {
      return;
    }

    const bit = document.createElement("span");
    bit.className = "cyber-trail";
    bit.textContent = Math.random() > 0.5 ? "1" : "0";
    bit.style.setProperty("--x", `${x}px`);
    bit.style.setProperty("--y", `${y}px`);
    backgroundSystem.appendChild(bit);

    window.setTimeout(() => {
      bit.remove();
    }, 1000);
  }

  function setActiveButton(panelName) {
    fileButtons.forEach((button) => {
      button.classList.toggle("active", button.dataset.panel === panelName);
    });
  }

  function setActivePanel(panelName) {
    contentPanels.forEach((panel) => {
      panel.classList.toggle("is-active", panel.dataset.content === panelName);
    });

    if (windowSwitcher) {
      windowSwitcher.hidden = panelName === "terminal";
    }

    windowSwitchButtons.forEach((button) => {
      button.classList.toggle("is-active", button.dataset.panelSwitch === panelName);
    });
  }

  function updateBackButton() {
    if (!backToTerminal) {
      return;
    }

    backToTerminal.hidden = backTargetPanel !== "terminal";
  }

  function openWindow(panelName, options = {}) {
    const meta = fileMeta[panelName];
    if (!meta) {
      return;
    }

    backTargetPanel = options.backTarget || "";

    setActiveButton(panelName);
    setActivePanel(panelName);
    windowTitle.textContent = meta.title;
    windowIcon.textContent = meta.icon;
    footerFileName.textContent = meta.title;
    updateBackButton();
    windowOverlay.hidden = false;
    body.classList.add("window-open");

    if (panelName === "terminal" && !terminalOutput.dataset.booted) {
      bootTerminal();
    }

    if (panelName === "terminal") {
      focusTerminalInput();
    }
  }

  function closeContentWindow() {
    windowOverlay.hidden = true;
    body.classList.remove("window-open");
    backTargetPanel = "";
    updateBackButton();
    setActiveButton("");
    setActivePanel("");
  }

  function showSidebar() {
    body.classList.remove("sidebar-hidden");
  }

  function hideSidebar() {
    body.classList.add("sidebar-hidden");
    closeMenu();
  }

  function toggleSidebarVisibility() {
    const hidden = body.classList.toggle("sidebar-hidden");
    if (hidden) {
      closeMenu();
    }
  }

  function noopWindowControl() {
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
  }

  function toggleMenu() {
    if (body.classList.contains("sidebar-hidden")) {
      showSidebar();
    }

    const isOpen = explorerPanel.classList.toggle("is-open");
    menuToggle.setAttribute("aria-expanded", String(isOpen));
  }

  function closeMenu() {
    explorerPanel.classList.remove("is-open");
    menuToggle.setAttribute("aria-expanded", "false");
  }

  function appendTerminalLine(text, className) {
    const line = document.createElement("p");
    line.className = `terminal-line ${className}`;
    line.textContent = text;
    terminalOutput.appendChild(line);
    terminalOutput.scrollTop = terminalOutput.scrollHeight;
    return line;
  }

  function printTerminalBlock(lines, className) {
    lines.forEach((lineText) => appendTerminalLine(lineText, className));
    appendTerminalLine("", "response");
  }

  function bootTerminal() {
    terminalOutput.dataset.booted = "true";
    terminalOutput.textContent = "";

    printTerminalBlock([
      "Sunil Dangal portfolio shell",
      "restricted environment: static browser terminal",
      "type `help` to list commands",
      "type `aws-quiz` for AWS SAA practice"
    ], "meta");
  }

  function printAwsQuizQuestion() {
    if (!awsQuizState) {
      return;
    }

    const current = awsQuizQuestions[awsQuizState.index];
    appendTerminalLine(`AWS SAA QUIZ ${awsQuizState.index + 1}/${awsQuizQuestions.length}`, "meta");
    appendTerminalLine(current.question, "response");
    current.choices.forEach((choice, index) => {
      const label = String.fromCharCode(97 + index);
      appendTerminalLine(`  ${label}) ${choice}`, "response");
    });
    appendTerminalLine("answer with: a, b, c, or d", "meta");
    appendTerminalLine("type `quit` to exit the quiz", "meta");
    appendTerminalLine("", "response");
  }

  function startAwsQuiz() {
    awsQuizState = {
      index: 0,
      score: 0
    };

    appendTerminalLine("starting AWS SAA practice quiz...", "meta");
    appendTerminalLine("20 questions loaded. one answer per question.", "meta");
    appendTerminalLine("", "response");
    printAwsQuizQuestion();
  }

  function finishAwsQuiz() {
    if (!awsQuizState) {
      return;
    }

    const total = awsQuizQuestions.length;
    const passMark = 17;
    const passed = awsQuizState.score >= passMark;
    appendTerminalLine(`quiz complete: ${awsQuizState.score}/${total} correct`, "meta");
    appendTerminalLine(`pass mark: ${passMark}/${total}`, "meta");
    appendTerminalLine(passed ? "result: PASS" : "result: FAIL - try again", passed ? "meta" : "command");
    appendTerminalLine("run `aws-quiz` to start a new round.", "meta");
    appendTerminalLine("", "response");
    awsQuizState = null;
  }

  function handleAwsQuizInput(command) {
    if (!awsQuizState) {
      return false;
    }

    const normalized = normalizeCommand(command);
    const current = awsQuizQuestions[awsQuizState.index];
    appendTerminalLine(`visitor@sunildangal:~$ ${command}`, "command");

    if (normalized === "quit" || normalized === "exit") {
      appendTerminalLine("quiz aborted.", "meta");
      appendTerminalLine(`score so far: ${awsQuizState.score}/${awsQuizState.index}`, "meta");
      appendTerminalLine("", "response");
      awsQuizState = null;
      return true;
    }

    if (normalized === "next" || normalized === "skip") {
      const answerIndex = current.answer.charCodeAt(0) - 97;
      appendTerminalLine(`skipped - correct answer: ${current.answer}) ${current.choices[answerIndex]}`, "meta");
      appendTerminalLine(current.explanation, "response");
      appendTerminalLine("", "response");
      awsQuizState.index += 1;

      if (awsQuizState.index >= awsQuizQuestions.length) {
        finishAwsQuiz();
        return true;
      }

      printAwsQuizQuestion();
      return true;
    }

    if (!["a", "b", "c", "d"].includes(normalized)) {
      appendTerminalLine("enter a, b, c, or d. type `quit` to leave quiz mode.", "meta");
      appendTerminalLine("", "response");
      return true;
    }

    if (normalized === current.answer) {
      awsQuizState.score += 1;
      appendTerminalLine("correct", "meta");
    } else {
      const answerIndex = current.answer.charCodeAt(0) - 97;
      appendTerminalLine(`incorrect - correct answer: ${current.answer}) ${current.choices[answerIndex]}`, "meta");
    }

    appendTerminalLine(current.explanation, "response");
    appendTerminalLine("", "response");

    awsQuizState.index += 1;

    if (awsQuizState.index >= awsQuizQuestions.length) {
      finishAwsQuiz();
      return true;
    }

    printAwsQuizQuestion();
    return true;
  }

  function runTerminalCommand(command) {
    const normalized = normalizeCommand(command);
    const [baseCommand, ...rest] = normalized.split(/\s+/);
    const commandTarget = rest.join(" ");
    const resolvedCommand = terminalData[normalized] ? normalized : baseCommand;

    if (normalized === "clear") {
      terminalOutput.textContent = "";
      awsQuizState = null;
      focusTerminalInput();
      return;
    }

    if (handleAwsQuizInput(command)) {
      focusTerminalInput();
      return;
    }

    if (panelCommandMap[normalized]) {
      openWindow(panelCommandMap[normalized], { backTarget: "terminal" });
      return;
    }

    if (normalized === "aws-quiz") {
      appendTerminalLine(`visitor@sunildangal:~$ ${command}`, "command");
      startAwsQuiz();
      focusTerminalInput();
      return;
    }

    if ((baseCommand === "open" || baseCommand === "cat") && panelCommandMap[commandTarget]) {
      openWindow(panelCommandMap[commandTarget], { backTarget: "terminal" });
      return;
    }

    if (!terminalData[resolvedCommand]) {
      appendTerminalLine(`visitor@sunildangal:~$ ${command}`, "command");
      appendTerminalLine(`command not found: ${command}`, "meta");
      appendTerminalLine("", "response");
      focusTerminalInput();
      return;
    }

    appendTerminalLine(`visitor@sunildangal:~$ ${command}`, "command");

    if (resolvedCommand === "date") {
      appendTerminalLine(new Date().toString(), "response");
      appendTerminalLine("", "response");
      focusTerminalInput();
      return;
    }

    printTerminalBlock(terminalData[resolvedCommand], resolvedCommand === "help" ? "meta" : "response");
    focusTerminalInput();
  }

  updateClock();
  createParticles();
  window.setInterval(updateClock, 1000);

  let lastTrailTime = 0;

  window.addEventListener("mousemove", (event) => {
    const now = Date.now();
    if (now - lastTrailTime > 70) {
      spawnCyberTrail(event.clientX, event.clientY);
      lastTrailTime = now;
    }
  }, { passive: true });

  window.addEventListener("touchmove", (event) => {
    const touch = event.touches[0];
    if (!touch) {
      return;
    }

    const now = Date.now();
    if (now - lastTrailTime > 90) {
      spawnCyberTrail(touch.clientX, touch.clientY);
      lastTrailTime = now;
    }
  }, { passive: true });

  menuToggle.addEventListener("click", toggleMenu);

  if (windowCloseControl) {
    windowCloseControl.addEventListener("click", toggleSidebarVisibility);
  }

  if (windowMinimizeControl) {
    windowMinimizeControl.addEventListener("click", noopWindowControl);
  }

  if (windowMaximizeControl) {
    windowMaximizeControl.addEventListener("click", noopWindowControl);
  }

  if (explorerClose) {
    explorerClose.addEventListener("click", closeMenu);
  }

  if (backToTerminal) {
    backToTerminal.addEventListener("click", () => {
      openWindow("terminal");
    });
  }

  windowSwitchButtons.forEach((button) => {
    button.addEventListener("click", () => {
      openWindow(button.dataset.panelSwitch, { backTarget: backTargetPanel });
    });
  });

  fileButtons.forEach((button) => {
    button.addEventListener("click", () => {
      if (button.dataset.command === "aws-quiz") {
        openWindow("terminal");
        if (!terminalOutput.dataset.booted) {
          bootTerminal();
        }
        appendTerminalLine("launching sidebar quiz shortcut...", "meta");
        startAwsQuiz();
        focusTerminalInput();
        return;
      }

      openWindow(button.dataset.panel);
    });
  });

  terminalFab.addEventListener("click", () => {
    openWindow("terminal");
  });

  closeWindow.addEventListener("click", closeContentWindow);

  windowOverlay.addEventListener("click", (event) => {
    if (event.target === windowOverlay) {
      closeContentWindow();
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !windowOverlay.hidden) {
      closeContentWindow();
      return;
    }

    if (event.key === "Escape" && explorerPanel.classList.contains("is-open")) {
      closeMenu();
    }
  });

  document.addEventListener("click", (event) => {
    if (window.innerWidth > 980 || !explorerPanel.classList.contains("is-open")) {
      return;
    }

    const target = event.target;
    if (!(target instanceof Node)) {
      return;
    }

    const clickedInsideExplorer = explorerPanel.contains(target);
    const clickedMenuToggle = menuToggle.contains(target);

    if (!clickedInsideExplorer && !clickedMenuToggle) {
      closeMenu();
    }
  });

  terminalButtons.forEach((button) => {
    button.addEventListener("click", () => {
      runTerminalCommand(button.dataset.command);
      focusTerminalInput();
    });
  });

  terminalForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const value = terminalInput.value;
    if (!value.trim()) {
      return;
    }

    terminalHistory.push(value);
    historyIndex = terminalHistory.length;
    runTerminalCommand(value);
    terminalInput.value = "";
  });

  terminalInput.addEventListener("keydown", (event) => {
    if (event.key === "ArrowUp") {
      event.preventDefault();
      if (!terminalHistory.length) {
        return;
      }
      historyIndex = Math.max(0, historyIndex - 1);
      terminalInput.value = terminalHistory[historyIndex] || "";
    }

    if (event.key === "ArrowDown") {
      event.preventDefault();
      if (!terminalHistory.length) {
        return;
      }
      historyIndex = Math.min(terminalHistory.length, historyIndex + 1);
      terminalInput.value = terminalHistory[historyIndex] || "";
    }
  });
});
