import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  Delete,
  UseGuards,
  Request,
  ForbiddenException,
} from '@nestjs/common';
import { BoardsService } from './boards.service';
import { Board } from './board.entity';
import { AuthGuard } from '@nestjs/passport';
import { CreateBoardDto } from './dto/create-board.dto';
import { UpdateBoardDto } from './dto/update-board.dto';
import { Roles } from 'src/common/decorator/role.decorator';
import { RolesGuard } from 'src/common/guard/roles.guard';

@Controller('boards')
export class BoardsController {
  constructor(private readonly boardsService: BoardsService) {}

  @UseGuards(AuthGuard('jwt'))
  @Post()
  async create(
    @Body() createBoardDto: CreateBoardDto,
    @Request() req,
  ): Promise<Board> {
    console.log('User from request:', req.user); // 디버그용 로그
    return this.boardsService.create(createBoardDto, req.user.userId); // userId만 전달
  }

  @UseGuards(AuthGuard('jwt'))
  @Get()
  async findAll(): Promise<Board[]> {
    return this.boardsService.findAll();
  }

  @UseGuards(AuthGuard('jwt'))
  @Get(':id')
  async findOne(@Param('id') id: number): Promise<Board> {
    return this.boardsService.findOne(id);
  }

  @UseGuards(AuthGuard('jwt'))
  @Patch(':id')
  async update(
    @Param('id') id: number,
    @Body() updateBoardDto: UpdateBoardDto,
    @Request() req,
  ): Promise<Board> {
    const board = await this.boardsService.findOne(id);
    if (board.user.id !== req.user.userId) {
      throw new ForbiddenException('작성자만 수정할 수 있습니다.');
    }
    return this.boardsService.update(id, updateBoardDto);
  }

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin') // 관리자 또는 작성자만 삭제 가능하도록 설정
  @Delete(':id')
  async remove(@Param('id') id: number, @Request() req): Promise<void> {
    const board = await this.boardsService.findOne(id);

    // 게시글 작성자 확인 후 삭제
    if (board.user.id !== req.user.userId) {
      throw new ForbiddenException('과제 끝!! 삭제 안 되지롱');
    }
    await this.boardsService.remove(id);
  }
}
