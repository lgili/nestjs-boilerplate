import { PartialType } from '@nestjs/swagger';

import { CommonSearchFieldDto } from '@core/extra/common-search-field.dto';

export class UserSearchFilterDto extends PartialType(CommonSearchFieldDto) {}
