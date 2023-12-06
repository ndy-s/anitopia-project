import { Document, ObjectId } from "mongoose";
import { ICharacterModel, IAttributes } from "./ICharacterModel";
import { IPlayerModel } from "./IPlayerModel";

export interface ICharaCollectionModel extends Document {
    playerId: ObjectId | IPlayerModel;
    characterId: string;
    character: ObjectId | ICharacterModel;
    level: number;
    experience: number;
    rarity: 'Common' | 'Uncommon' | 'Rare' | 'Epic' | 'Legendary';
    attributes: IAttributes;
    createdAt: Date;
    updatedAt: Date;
}