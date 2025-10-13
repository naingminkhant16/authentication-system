import {Controller, Get, HttpCode, HttpStatus} from "@nestjs/common";
import {DepartmentService} from "./department.service";
import {ApiResponse} from "../../common/utils/api.response";

@Controller('api/departments')
export class DepartmentController {
    constructor(private readonly departmentService: DepartmentService) {
    }

    @Get()
    @HttpCode(HttpStatus.OK)
    async getAllDepartments() {
        const departments = await this.departmentService.getAll();
        return ApiResponse.success(departments, 'Department List');
    }
}