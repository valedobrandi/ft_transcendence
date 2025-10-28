class AuthenticationRoom {
    private authRoom = new Map<string, string>();

    add(id: string, code: string) {
        this.authRoom.set(id, code);
    }

    getCode(id: string): string | undefined {
        return this.authRoom.get(id);
    }

    verify(id: string, code: string): boolean {
        const storedCode = this.authRoom.get(id);
        return storedCode === code;
    }

    delete(id: string) {
        this.authRoom.delete(id);
    }
}

export const authenticationRoomInstance = new AuthenticationRoom();