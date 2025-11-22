import DOMPurify from "dompurify";

export function ProfileContainer() {
	const html = `
	<div class="profile-container border-2 border-black rounded-2xl">
	  <h2 class="container-title border-b-2 border-black text-xl font-bold p-2 text-center">
	  	PROFILE VIEW
	</h2>
	</div>
  `;
	const mainDiv = document.createElement("div");
	mainDiv.innerHTML = DOMPurify.sanitize(html);
	return mainDiv.firstElementChild || document.createElement("div");
}
