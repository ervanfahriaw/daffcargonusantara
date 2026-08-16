import AdmZip from "adm-zip";
import fs from "fs";

try {
  const filePath = "D:/PROJEKAN/dcn-opshub-project-scaffold/project/PT_Daff_Cargo_Nusantara_Flowchart.docx";
  if (!fs.existsSync(filePath)) {
    console.error("File not found:", filePath);
    process.exit(1);
  }
  
  // Let's check with AdmZip if available, or using node decompress / python
  console.log("File exists! Size:", fs.statSync(filePath).size);
} catch (e) {
  console.error(e);
}
