import {Controller, Get, HttpCode, HttpStatus, Query} from "@nestjs/common";
import {DepartmentService} from "./department.service";
import {ApiResponse} from "../../common/utils/api.response";

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
}