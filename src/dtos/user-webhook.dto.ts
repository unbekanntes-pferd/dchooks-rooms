
export class UserPayload {
    baseUrl: string
    id: number
    userName: string
    login: string
    authMethod: string
    firstName: string
    lastName: string
    isLocked: boolean
    avatarUuid: string
    email: string
    phone: string
    title: string
    expireAt: Date
    hasManageableRooms: boolean
    isEncryptionEnabled: boolean
    lastLoginSuccessAt: Date
    homeRoomId: number
    language: string

}

export class UserWebhookDto {

    payload: UserPayload
}
