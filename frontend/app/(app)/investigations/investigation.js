/*
 * MPLADS AI Monitor - Investigation Module
 * Handles: investigation workspace, stepper, notes, case actions
 */

// ==================== INVESTIGATION WORKSPACE ====================
function loadInvestigationCase(projectId) {
  const proj = projectsData.find(p => p.id === projectId);
  if (!proj || !proj.investigation) return;

  selectedProject = proj;
  const inv = proj.investigation;

  // Fill textual data
  document.getElementById("inv-case-id").textContent = inv.caseId;
  document.getElementById("inv-proj-id").textContent = proj.id;
  document.getElementById("inv-proj-title").textContent = `${proj.title}, ${proj.district}`;

  // Fill AI Findings List
  const findingsList = document.getElementById("inv-findings-list");
  findingsList.innerHTML = "";

  proj.evidence.forEach(ev => {
    const item = document.createElement("div");
    item.className = "finding-summary-item";
    item.innerHTML = `
      <span class="finding-summary-name">${ev.factor}</span>
      <span class="finding-summary-points ${ev.riskClass}">${ev.points}</span>
    `;
    findingsList.appendChild(item);
  });

  // Risk score removed

  // Fill Notes Area
  document.getElementById("inv-notes-editor").value = inv.notes;
  updateCharCounter();

  // Update Stepper steps
  updateStepperDisplay(inv.currentStep, inv.stepDates);

  switchView("investigation");
}

function updateStepperDisplay(currentStep, stepDates) {
  // Stepper dates bindings
  for (let i = 1; i <= 5; i++) {
    const dateEl = document.getElementById(`step-date-${i}`);
    if (dateEl && stepDates[i - 1]) {
      dateEl.textContent = stepDates[i - 1];
    }
  }

  // Node styles
  document.querySelectorAll(".stepper-wrapper .step-item").forEach(node => {
    const stepNum = parseInt(node.getAttribute("data-step"));
    node.classList.remove("completed", "active");

    if (stepNum < currentStep) {
      node.classList.add("completed");
      // Change node icon to checkmark
      node.querySelector(".step-node").innerHTML = `<i data-lucide="check" style="width: 14px;"></i>`;
    } else if (stepNum === currentStep) {
      node.classList.add("active");
      // Restore standard icons for active
      const iconMap = ["plus", "search", "map-pin", "file-check", "check-circle-2"];
      node.querySelector(".step-node").innerHTML = `<i data-lucide="${iconMap[stepNum - 1]}" style="width: 14px;"></i>`;
    } else {
      // Restore standard icons for pending
      const iconMap = ["plus", "search", "map-pin", "file-check", "check-circle-2"];
      node.querySelector(".step-node").innerHTML = `<i data-lucide="${iconMap[stepNum - 1]}" style="width: 14px;"></i>`;
    }
  });

  // Stepper fill bar percentage: Step 1 (0%), Step 2 (25%), Step 3 (50%), Step 4 (75%), Step 5 (100%)
  const percentage = (currentStep - 1) * 25;
  document.getElementById("inv-stepper-progress").style.width = `${percentage}%`;

  lucide.createIcons();
}

function updateCharCounter() {
  const textarea = document.getElementById("inv-notes-editor");
  const counter = document.getElementById("inv-char-counter");
  const len = textarea.value.length;
  counter.textContent = `${len} / 2000 characters`;
}

// Investigation Button Action Handlers
function initInvestigationControls() {
  const textarea = document.getElementById("inv-notes-editor");
  textarea.addEventListener("input", updateCharCounter);

  const verifyBtn = document.getElementById("btn-act-verify");
  const escalateBtn = document.getElementById("btn-act-escalate");
  const closeBtn = document.getElementById("btn-act-close");

  const todayStr = () => {
    const d = new Date();
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
  };

  const addNoteLog = (logMsg) => {
    const timeStamp = todayStr();
    textarea.value += `\n\n-- ${timeStamp}: ${logMsg}`;
    updateCharCounter();
    if (selectedProject && selectedProject.investigation) {
      selectedProject.investigation.notes = textarea.value;
    }
  };

  verifyBtn.addEventListener("click", () => {
    if (!selectedProject || !selectedProject.investigation) return;
    const inv = selectedProject.investigation;

    if (inv.currentStep < 3) {
      inv.currentStep = 3;
      inv.stepDates[2] = todayStr();
      addNoteLog("Status advanced to Field Verification.");
      updateStepperDisplay(3, inv.stepDates);
    }
  });

  escalateBtn.addEventListener("click", () => {
    if (!selectedProject || !selectedProject.investigation) return;
    const inv = selectedProject.investigation;

    if (inv.currentStep < 4) {
      // Ensure preceding steps are marked filled
      if (inv.currentStep < 3) inv.stepDates[2] = todayStr();
      inv.currentStep = 4;
      inv.stepDates[3] = todayStr();
      addNoteLog("Case escalated. Finding Recorded: Potential Unit-Rate Overrun, recommending administrative hold.");
      updateStepperDisplay(4, inv.stepDates);
    }
  });

  closeBtn.addEventListener("click", () => {
    if (!selectedProject || !selectedProject.investigation) return;
    const inv = selectedProject.investigation;

    if (inv.currentStep < 5) {
      // Ensure all preceding steps are marked
      if (inv.currentStep < 3) inv.stepDates[2] = todayStr();
      if (inv.currentStep < 4) inv.stepDates[3] = todayStr();
      inv.currentStep = 5;
      inv.stepDates[4] = todayStr();
      addNoteLog("Investigation closed. Administrative corrective action initiated.");
      updateStepperDisplay(5, inv.stepDates);
    }
  });
}