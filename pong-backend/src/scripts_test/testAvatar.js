import fs from 'fs';
import FormData from 'form-data';
import axios from 'axios';

async function testUpload() {
  const form = new FormData();
  form.append('file', fs.createReadStream('./avatar-test.png')); // ton fichier test

  const idUser = 1;
  const res = await axios.post(`http://localhost:3000/profil/avatar/${idUser}`, form, {
    headers: form.getHeaders(),
  });

  //console.log(res.data);
}

testUpload();