import axios, { type AxiosResponse } from "axios";
import { load, type CheerioAPI } from "cheerio";

const URL: string = "https://www.cepea.org.br/br/indicador/feijao.aspx";

interface RowData {
  [key: string]: string;
}

interface TableData {
  tableId: string;
  description: string;
  headers: string[];
  rows: RowData[];
}

interface ScrapeResult {
  pageTitle: string;
  indicators: TableData[];
}

export const getBeansQuotation = async (): Promise<string> => {
  console.log(`-> Attempting to fetch data from: ${URL}`);

  try {
    const response: AxiosResponse<string> = await axios.get(URL, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
      },
      timeout: 15000,
    });

    const html: string = response.data;

    const $: CheerioAPI = load(html);

    const pageTitle: string = $("title").text().trim() || "No Title Found";
    const resultData: ScrapeResult = {
      pageTitle: pageTitle,
      indicators: [],
    };

    let mainContent = $("#conteudo");

    if (mainContent.length === 0) {
      console.log(
        "-> Main content selector failed. Searching entire body for tables."
      );
      mainContent = $("body");
    }

    const tables = mainContent.find("table");

    console.log(`-> Found ${tables.length} potential data tables.`);

    tables.each((i: number, element: any) => {
      const table = $(element);

      let description: string = `Tabela de Indicadores ${i + 1}`;
      let prevHeader = table.prevAll("h2, h3, h4").first();
      if (prevHeader.length) {
        description = prevHeader.text().trim();
      }

      const tableData: TableData = {
        tableId: `table_${i + 1}`,
        description: description,
        headers: [],
        rows: [],
      };

      const headerRow = table.find("thead tr th");
      headerRow.each((j: number, th: any) => {
        tableData.headers.push($(th).text().trim().replace(/\s+/g, " "));
      });

      if (tableData.headers.length === 0) {
        const firstRowCells = table.find("tbody tr").first().find("td, th");
        firstRowCells.each((j: number, cell: any) => {
          tableData.headers.push($(cell).text().trim().replace(/\s+/g, " "));
        });
      }

      const bodyRows = table.find("tbody tr");
      bodyRows.each((k: number, tr: any) => {
        const cells = $(tr).find("td, th");
        const rowData: RowData = {};

        cells.each((l: number, cell: any) => {
          const cellText: string = $(cell).text().trim().replace(/\s+/g, " ");

          const key: string = tableData.headers[l] || `col_${l + 1}`;
          rowData[key] = cellText;
        });

        if (Object.keys(rowData).some((key) => rowData[key].length > 0)) {
          tableData.rows.push(rowData);
        }
      });

      if (tableData.rows.length > 0 || tableData.headers.length > 0) {
        resultData.indicators.push(tableData);
      }
    });

    return JSON.stringify(resultData, null, 2);
  } catch (error: any) {
    console.error("Error during scraping:", error.message);

    if (error.response) {
      console.error("HTTP Status Code:", error.response.status);
    }
    return JSON.stringify(
      { error: "Failed to scrape data.", details: error.message },
      null,
      2
    );
  }
};
