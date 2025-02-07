document.getElementById("jsonFile").addEventListener("change", function (e) {
  const file = e.target.files[0];
  const reader = new FileReader();

  reader.onload = function (e) {
    try {
      const data = JSON.parse(e.target.result);
      displayData(data);
    } catch (error) {
      alert("Neplatný JSON formát");
    }
  };

  reader.readAsText(file);
});

function displayDataAsTable(data) {
  const output = document.getElementById("output");

  // Pokud je data pole, vytvoříme tabulku s dynamickými sloupci
  if (Array.isArray(data)) {
    const table = document.createElement("table");
    table.border = "1";
    const headerRow = document.createElement("tr");

    // Vytvoření hlavičky tabulky na základě prvního objektu
    Object.keys(data[0]).forEach((key) => {
      const th = document.createElement("th");
      th.textContent = key;
      headerRow.appendChild(th);
    });
    table.appendChild(headerRow);

    // Vytvoření řádků pro každý objekt v poli
    data.forEach((item) => {
      const row = document.createElement("tr");
      Object.values(item).forEach((value) => {
        const td = document.createElement("td");
        td.textContent = value;
        row.appendChild(td);
      });
      table.appendChild(row);
    });

    output.innerHTML = ""; // Vyčistí předchozí obsah
    output.appendChild(table);
  } else {
    output.innerHTML = "<p>Data nejsou ve formátu pole</p>";
  }
}
