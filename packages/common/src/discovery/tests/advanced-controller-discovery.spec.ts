import {
  Controller,
  Get,
  Module,
  Post,
  Put,
  ReflectMetadata,
  RequestMethod
} from '@nestjs/common';
import { METHOD_METADATA, PATH_METADATA } from '@nestjs/common/constants';
import { Test, TestingModule } from '@nestjs/testing';
import { DiscoveryModule, DiscoveryService } from '..';

const rolesKey = 'roles';
const Roles = (roles: string[]) => ReflectMetadata(rolesKey, roles);

@Controller('guest')
@Roles(['guest', 'anotherRole'])
class GuestController {
  @Get('route-path-one')
  method1() {
    return 'method1';
  }

  @Roles(['guest'])
  @Put('some-put-route')
  putMethod() {
    return 'whatever';
  }
}

@Controller('super')
class RolesMethodController {
  @Get('route-path-two')
  @Roles(['guest'])
  method2() {
    return 'method2';
  }

  @Get('red-herring-route')
  @Roles(['super'])
  superMethod() {
    return 'super';
  }
}

@Controller('admin')
@Roles(['admin'])
class AdminController {
  @Post('route-path-three')
  @Roles(['guest'])
  method2() {
    return 'method3';
  }
}

@Module({
  controllers: [GuestController, RolesMethodController, AdminController]
})
class ExampleModule {}

describe('Advanced Controller Discovery', () => {
  let app: TestingModule;
  let discover: DiscoveryService;

  beforeEach(async () => {
    app = await Test.createTestingModule({
      imports: [DiscoveryModule, ExampleModule]
    }).compile();

    await app.init();

    discover = app.get<DiscoveryService>(DiscoveryService);
  });

  it('can discover all controllers with roles', () => {
    const rolesControllers = discover.controllersWithMeta<string[]>(rolesKey);

    expect(rolesControllers).toHaveLength(2);

    const guestControllers = rolesControllers.filter(x =>
      x.meta.includes('guest')
    );

    expect(guestControllers).toHaveLength(1);
    const [guestController] = guestControllers;
    expect(guestController.discoveredClass.ctorFunction).toBe(GuestController);
    expect(guestController.discoveredClass.instance).toBeInstanceOf(
      GuestController
    );
  });

  it('can discover controller methods with roles', () => {
    const rolesMethods = discover.controllerMethodsWithMeta<string[]>(rolesKey);

    expect(rolesMethods).toHaveLength(4);

    const guestMethods = rolesMethods.filter(x => x.meta.includes('guest'));
    expect(guestMethods).toHaveLength(3);
  });

  it('can discover all controller methods decorated with guest roles or belonging to controllers with guest roles', () => {
    const allMethods = discover.methodsAndControllerMethodsWithMeta<string[]>(
      rolesKey,
      x => x.includes('guest')
    );

    expect(allMethods).toHaveLength(4);

    const fullPaths = allMethods.map(x => {
      const controllerPath = Reflect.getMetadata(
        PATH_METADATA,
        x.discoveredMethod.parentClass.ctorFunction
      );

      const methodPath = Reflect.getMetadata(
        PATH_METADATA,
        x.discoveredMethod.handler
      );
      const methodHttpVerb = Reflect.getMetadata(
        METHOD_METADATA,
        x.discoveredMethod.handler
      );

      return {
        verb: methodHttpVerb,
        path: `${controllerPath}/${methodPath}`
      };
    });

    expect(fullPaths).toContainEqual({
      verb: RequestMethod.GET,
      path: 'guest/route-path-one'
    });
    expect(fullPaths).toContainEqual({
      verb: RequestMethod.GET,
      path: 'super/route-path-two'
    });
    expect(fullPaths).toContainEqual({
      verb: RequestMethod.POST,
      path: 'admin/route-path-three'
    });
    expect(fullPaths).toContainEqual({
      verb: RequestMethod.PUT,
      path: 'guest/some-put-route'
    });
  });
});
