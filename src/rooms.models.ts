import { HttpStatus } from "@nestjs/common";

export class Pagination {

    offset: number
    limit: number
    total: number
}

export class KeyValueAttribute {
    key: string
    value: string
}

export class RoomCreatedResponse {
    id:                        number;
    type:                      string;
    name:                      string;
    timestampCreation?:         Date;
    timestampModification?:     Date;
    parentId?:                  number;
    parentPath?:                string;
    createdAt?:                 Date;
    createdBy?:                 CreatedBy;
    updatedAt?:                 Date;
    updatedBy?:                 CreatedBy;
    expireAt?:                  Date;
    hash?:                      string;
    fileType?:                  string;
    mediaType?:                 string;
    size?:                      number;
    classification?:            number;
    notes?:                     string;
    permissions?:               Permissions;
    inheritPermissions?:        boolean;
    isEncrypted?:               boolean;
    encryptionInfo?:            EncryptionInfo;
    cntDeletedVersions?:        number;
    cntComments?:               number;
    cntDownloadShares?:         number;
    cntUploadShares?:           number;
    recycleBinRetentionPeriod?: number;
    hasActivitiesLog?:          boolean;
    quota?:                     number;
    isFavorite?:                boolean;
    branchVersion?:             number;
    mediaToken?:                string;
    isBrowsable?:               boolean;
    cntRooms?:                  number;
    cntFolders?:                number;
    cntFiles?:                  number;
    authParentId?:              number;
}

class CreatedBy {
    id:         number;
    userType:   string;
    avatarUUID: string;
    userName:   string;
    firstName:  string;
    lastName:   string;
    email?:      string;
}

class EncryptionInfo {
    userKeyState:      string;
    roomKeyState:      string;
    dataSpaceKeyState: string;
}

export class Permissions {
    manage:              boolean;
    read:                boolean;
    create:              boolean;
    change:              boolean;
    delete:              boolean;
    manageDownloadShare: boolean;
    manageUploadShare:   boolean;
    readRecycleBin:      boolean;
    restoreRecycleBin:   boolean;
    deleteRecycleBin:    boolean;
}


class RoomUserDetails {
    userInfo: RoomUserInfo
    isGranted: boolean
    permissions?: Permissions
    publicKeyContainer?: PublicKeyContainer

}

class RoomUserInfo {
    id: number
    userType: string
    avatarUuid: string
    userName: string
    firstName: string
    lastName: string
    email?: string
}

class PublicKeyContainer {
    version: string
    publicKey: string
    createdAt?: Date
    createdBy?: number
}

export class RoomUsersResponse {
    range: Pagination
    items: RoomUserDetails[]
}

class PermissionsValid {
    valid: boolean
}

export class RoomValidResponse {
    statusCode: HttpStatus
    roomInfo: KeyValueAttribute
    permissions: PermissionsValid

}