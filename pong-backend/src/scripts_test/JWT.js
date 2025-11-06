import fetch from "node-fetch";

async function testJwt() {
    const userId = 1;
    const friendId = 2;

    const response = await fetch(`http://localhost:3000/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(
            {
                username: 'lola',
                password: 'pass',
            }
        )
    });

    const data = await response.json();
    console.log('Reply server:', data);

    const profile = await fetch(`http://localhost:3000/profile`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        headers: {
            Authorization: `Bearer ${data.payload.accessToken}`,
        },

    });
    const p = await profile.json()
    console.log('response profile:', p);
}

testJwt()