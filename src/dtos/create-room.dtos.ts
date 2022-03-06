

export class CreateRoomDto {

    // generate payload to create a room 
    constructor(
      public name: string,
      public parentId,
      public recycleBinRetentionPeriod: number,
      public inheritPermissions: boolean,
      public adminIds: number[],
      public adminGroupIds?: number[],
      public classification?: number,
      public quota?: number,
    ) {
     
    }

}

export class CreatePersonalRoomDto {

  userId: number
  name?: string
  recycleBinRetentionPeriod?: number
  
  }