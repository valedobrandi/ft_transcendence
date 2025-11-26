export function ProfileLogoutButton() {;
  return `
<div class="p-4 flex justify-around items-center w-full">
  <button 
  id="profile-btn" 
  class="border-2 border-black p-4 rounded cursor-pointer hover:bg-gray-200">
    PROFILE
  </button>
  <button id="btn-logout" class="border-2 border-black p-4 rounded cursor-pointer hover:bg-gray-200">LOGOUT</button>
</div>
`;

}
