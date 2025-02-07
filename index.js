//NAČÍTANÍ DOKUMENTŮ JSON
document.getElementById("jsonFile").addEventListener("change", function (e) {
  const file = e.target.files[0];
  const reader = new FileReader();

  reader.onload = function (e) {
    const data = JSON.parse(e.target.result);
    loadTableData(data);
  };

  reader.readAsText(file);
});

//SEKCE PRO TABULKU
const sectionName = {
  basicInfo: [
    "orderNumber",
    "poNumber",
    "createdDate",
    "dueDate",
    "currency",
    "partnerName",
  ],
  billingContact: ["billingContact"],
  technicalContact: ["technicalContact"],
  others: ["orderItems"],
  total: ["totalExTax", "totalIncTax", "totalTax"],
};

const dateFields = ["createdDate", "dueDate", "startDate", "endDate"];

//FORMÁTOVÁNÍ DATA
function formatDate(dateString) {
  if (!dateString) return "";
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return dateString;

  return date.toLocaleDateString("cs-CZ", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

//ÚPRAVA KEY
function getLastPart(key) {
  return key.split(".").pop();
}

//KONTROLA DATA
function isDateField(key) {
  const lastPart = getLastPart(key);
  return dateFields.includes(lastPart);
}

//ROZDĚLENÍ DO SEKCÍ PODLE KLÍČŮ
function getSectionForKey(fullKey) {
  for (const sectionKey in sectionName) {
    const sectionKeys = sectionName[sectionKey];
    if (
      sectionKeys.some(
        (key) => fullKey === key || fullKey.startsWith(key + ".")
      )
    ) {
      return sectionKey;
    }
  }
  return "others";
}

//NAČÍTANÍ DAT DO TABULKY
function loadTableData(data) {
  const parentElement = document.getElementById("dataTable");
  parentElement.innerHTML = "";

  const table = document.createElement("table");

  const tbody = document.createElement("tbody");

  //VYTVOŘENÍ SEKCÍ
  function addSection(sectionName) {
    const sectionRow = document.createElement("tr");
    sectionRow.classList.add(`section-${sectionName}`);

    const sectionCell = document.createElement("td");
    sectionCell.colSpan = 2;
    sectionCell.textContent = sectionName;
    sectionCell.style.fontWeight = "bold";

    sectionRow.appendChild(sectionCell);
    tbody.appendChild(sectionRow);
  }

  //VYTVOŘENÍ TABULKY S INPUTY
  function addRow(key, value, section) {
    const existingSection = tbody.querySelector(`.section-${section}`);
    if (!existingSection) {
      addSection(section);
    }
    const row = document.createElement("tr");
    row.classList.add(`section-${section}`);

    const nameCell = document.createElement("td");
    nameCell.classList.add("first-td");
    nameCell.textContent = getLastPart(key);

    const valueCell = document.createElement("td");
    const input = document.createElement("input");
    valueCell.classList.add("second-td");
    input.type = "text";

    if (isDateField(key)) {
      input.value = formatDate(value);
    } else {
      input.value = value;
    }

    valueCell.appendChild(input);

    row.appendChild(nameCell);
    row.appendChild(valueCell);
    tbody.appendChild(row);
  }
  //ROZBALENÍ VLOŽENÝCH OBJEKTŮ
  function processData(obj, prefix = "") {
    Object.entries(obj).forEach(([key, value]) => {
      const fullKey = prefix ? `${prefix}.${key}` : key;
      const section = getSectionForKey(fullKey);

      if (typeof value === "object" && value !== null) {
        processData(value, fullKey);
      } else {
        addRow(fullKey, value, section);
      }
    });
  }

  processData(data);
  table.appendChild(tbody);
  parentElement.appendChild(table);
}

//PŘEPÍNÁNÍ MEZI STRÁNKAMI
function showSection(sectionId) {
  const sections = document.querySelectorAll(".section");

  sections.forEach((section) => (section.style.display = "none"));

  document.getElementById(sectionId).style.display = "block";
}

document.addEventListener("DOMContentLoaded", function () {
  document.querySelector(".dropdown-menu");
});

//NAČÍTANÍ DAT Z QUOTE DO OFFER
function loadOffers() {
  const savedOffers = JSON.parse(localStorage.getItem("offers")) || [];
  boList.innerHTML = "";
  savedOffers.forEach((offer) => {
    addOfferToList(offer);
  });
}

//ULOŽENÍ DAT PŘES TLAČÍTKO
document.getElementById("saveButton").addEventListener("click", function () {
  let currentVersion = parseInt(localStorage.getItem("offerVersion")) || 1;

  const offer = {
    orderNumber: document.getElementById("orderNumber").value,
    customer: document.getElementById("technicalContact-companyName").value,
    partner: document.getElementById("billingContact-companyName").value,
    description: document.getElementById("description").value,
    version: "version: " + currentVersion,
    tableData: getTableData(),
  };

  function saveOffer(offer, currentVersion) {
    const savedOffers = JSON.parse(localStorage.getItem("offers")) || [];
    savedOffers.push(offer);
    localStorage.setItem("offers", JSON.stringify(savedOffers));
    localStorage.setItem("offerVersion", currentVersion + 1);
    addOfferToList(offer);
  }
  saveOffer(offer, currentVersion);
});

//ZOBRAZENÍ OFFER POD BO
function addOfferToList(offer) {
  const boList = document.getElementById("boList");

  if (!boList) {
    console.error("Element 'boList' nebyl nalezen!");
    return;
  }

  const listItem = document.createElement("li");
  const button = document.createElement("button");
  button.textContent = `Offer ${offer.orderNumber} - ${offer.version}`;
  button.addEventListener("click", function () {
    displayTable(offer);
  });

  listItem.appendChild(button);
  boList.appendChild(listItem);
}

document.querySelector(".dropdown-btn")?.addEventListener("click", function () {
  const menu = document.querySelector(".dropdown-menu");
  if (menu) {
    menu.style.display = menu.style.display === "block" ? "none" : "block";
  }
});
