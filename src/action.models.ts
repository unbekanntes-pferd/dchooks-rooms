export enum EventTypeNames {

    userCreated = "user.created",
    userDeleted = "user.deleted",
    userLocked = "user.locked",
    webhookExpiring = "webhook.expiring",
    downloadShareCreated = "downloadshare.created",
    downloadShareDeleted = "downloadshare.deleted",
    downloadShareUsed = "downloadshare.used",
    uploadShareCreated = "uploadshare.created",
    uploadShareDeleted = "uploadshare.deleted",
    uploadShareUsed = "uploadshare.used",
    fileCreated = "file.created",
    fileDeleted = "file.deleted",
    folderCreated = "folder.created",
    folderDeleted = "folder.deleted",
    roomCreated = "room.created",
    roomDeleted = "room.deleted"

}

export enum RoomActionType {
    createRoom = "create.room",
    deleteRoom = "delete.room",
    updateRoom = "update.room",
    syncRooms = "sync.rooms",
    getRooms = "get.rooms"
}


export class Message { 
    msg: EventTypeNames
}

export class RoomMessage {
    msg: RoomActionType
}