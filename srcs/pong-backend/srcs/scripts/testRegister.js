import fetch from 'node-fetch';

async function testRegister() {
  const response = await fetch('http://localhost:3000/register', 
{
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'bob@hotmail.com',
      username: 'Bob',
      password: '123456'
    })
  });

  const data = await response.json();
  console.log('Reply server :', data);
}

testRegister();