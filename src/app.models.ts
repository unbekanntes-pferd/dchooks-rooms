export class AuthTokenResponse {
    access_token: string
    token_type: string
    refresh_token: string
    expires_in: number
    scope: string
}

class Role {
    id: number
    name: string
    description: string

}

class RoleList {
    items: Role[]
}

enum AuthenticationMethod {
    basic = "basic",
    active_directory = "active_directory",
    radius = "radius",
    openid = "openid"
}

class UserAuthData {
    method: AuthenticationMethod
    login?: string
    password?: string
    mustChangePassword?: boolean
    adConfigId?: number
    oidConfigId?: number
}

export class UserAccount {
    id: number
    userName: string
    firstName: string
    lastName: string
    isLocked: boolean
    hasManageableRooms: boolean
    userRoles: RoleList
    language: string
    authData: UserAuthData
    mustSetEmail?: boolean
    needsToAcceptEULA?: boolean
    expireAt: Date
    isEncryptionEnabled?: boolean
    lastLoginSuccessAt?: Date
    lastLoginFailAt?: Date
    email?: string
    phone?: string
    homeRoomId?: number
    customer?: any
}