export const VITE_BACKEND_HOST = import.meta.env.VITE_BACKEND_HOST;

const endpoint = {
	backend: `${VITE_BACKEND_HOST}` || 'localhost:3000'
}

export { endpoint };