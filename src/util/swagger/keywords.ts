import {ApiProperty} from '@nestjs/swagger';
import { IsArray } from "class-validator";

export class KeywordsPost {
    @IsArray()
    @ApiProperty({ isArray: true })
    keywords: string;
    @IsArray()
    @ApiProperty({ isArray: true })
    tags: string;
}

export class KeywordsPatch {
    @ApiProperty()
    id: number;
    @IsArray()
    @ApiProperty()
    keywords: string;
    @IsArray()
    @ApiProperty()
    tags: string;
}

export class KeywordsDelete {
    @ApiProperty()
    id: number;
}
