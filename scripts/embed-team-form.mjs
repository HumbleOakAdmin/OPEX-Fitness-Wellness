import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const file = path.join(path.dirname(fileURLToPath(import.meta.url)), '../meet-the-team/index.html');
const iframe =
  '<div class="w-form ms-forms-embed"><iframe width="640px" height="480px" src="https://forms.office.com/Pages/ResponsePage.aspx?id=NrkJ9Z9fEkSC6QRi_xoUmg-AtDKB6O1OpLtUioGgnI1UQk1NOVRQOVQzWEo4VEFVWlZVMUxIUTdOQi4u&embed=true" frameborder="0" marginwidth="0" marginheight="0" style="border: none; max-width:100%; max-height:100vh" allowfullscreen webkitallowfullscreen mozallowfullscreen msallowfullscreen> </iframe></div>';

let html = fs.readFileSync(file, 'utf8');
const start = html.indexOf('<div class="w-form"><form id="wf-form-Join-The-Team-Form"');
if (start === -1) throw new Error('Join The Team form not found');
const end = html.indexOf('</div></div></section>', start);
if (end === -1) throw new Error('Form section end not found');
html = html.slice(0, start) + iframe + html.slice(end);
fs.writeFileSync(file, html, 'utf8');
console.log('Replaced Join The Team form with Microsoft Forms embed.');
