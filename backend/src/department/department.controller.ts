import {Controller, ForbiddenException, Get, HttpCode, HttpStatus, Param, Query, Req, UseGuards} from "@nestjs/common";
import {DepartmentService} from "./department.service";
import {ApiResponse} from "../../common/utils/api.response";
import {AuthGuard} from "@nestjs/passport";
import {Request} from "express";

@Controller('api/departments')
export class DepartmentController {
    constructor(private readonly departmentService: DepartmentService) {
    }

    @Get()
    @HttpCode(HttpStatus.OK)
    async getAllDepartments(@Query('search') search: string) {
        const departments = await this.departmentService.getAll(search);
        return ApiResponse.success(departments, 'Department List');
    }


    @UseGuards(AuthGuard('jwt'))
    @Get(':id/employees')
    @HttpCode(HttpStatus.OK)
    async getEmployees(@Param('id') id: number, @Req() req: Request) {
        const user = req.user;

        if (user && id != user['auth'].departmentId) throw new ForbiddenException("User not belong to this department");

        const employeesData = await this.departmentService.getDepartmentEmployeesById(id);
        return ApiResponse.success(employeesData, 'success');
    }
}