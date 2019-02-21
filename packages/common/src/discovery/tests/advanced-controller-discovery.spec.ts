import { Controller, Get, Module, Post, ReflectMetadata, RequestMethod } from '@nestjs/common';
import { METHOD_METADATA, PATH_METADATA } from '@nestjs/common/constants';
import { Test, TestingModule } from '@nestjs/testing';
import { flatMap } from 'lodash';
import { DiscoveryModule, DiscoveryService } from '..';

const rolesKey = 'roles';
const Roles = (roles: string[]) => ReflectMetadata(rolesKey, roles);

@Controller('guest')
@Roles(['guest'])
class GuestController {
  @Get('route-path-one')
  method1() {
    return 'method1';
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
  let discoveryService: DiscoveryService;

  beforeEach(async () => {
    app = await Test.createTestingModule({
      imports: [DiscoveryModule, ExampleModule]
    }).compile();

    await app.init();

    discoveryService = app.get<DiscoveryService>(DiscoveryService);
  });

  it('can discover all controllers with roles', () => {
    const rolesControllers = discoveryService.discoverControllersWithMeta<
      string[]
    >(rolesKey);

    expect(rolesControllers).toHaveLength(2);

    const guestControllers = rolesControllers.filter(x =>
      x.meta.includes('guest')
    );

    expect(guestControllers).toHaveLength(1);
    const [guestController] = guestControllers;
    expect(guestController.component.metatype).toBe(GuestController);
    expect(guestController.component.instance).toBeInstanceOf(GuestController);
  });

  it('can discover controller methods with roles', () => {
    const rolesMethods = discoveryService.discoverControllerMethodsWithMeta<
      string[]
    >(rolesKey);

    expect(rolesMethods).toHaveLength(3);

    const guestMethods = rolesMethods.filter(x => x.meta.includes('guest'));
    expect(guestMethods).toHaveLength(2);
  });

  it('can discover all controller methods tagged with guest or belonging to guest controllers', () => {
    const guestControllers = discoveryService
      .discoverControllersWithMeta<string[]>(rolesKey)
      .filter(x => x.meta.includes('guest'));

    const methodsFromGuestControllers = flatMap(
      guestControllers,
      controller => {
        return discoveryService.discoverMethodMetaFromComponent(
          controller.component,
          PATH_METADATA
        );
      }
    );

    const guestMethods = discoveryService
      .discoverControllerMethodsWithMeta<string[]>(rolesKey)
      .filter(x => x.meta.includes('guest'));

    const allGuestMethods = [...methodsFromGuestControllers, ...guestMethods];
   
    const fullPaths = allGuestMethods.map(x => {
      const controllerPath = Reflect.getMetadata(
        PATH_METADATA,
        x.component.metatype
      );

      const methodPath = Reflect.getMetadata(PATH_METADATA, x.handler);
      const methodHttpVerb = Reflect.getMetadata(
        METHOD_METADATA,
        x.handler
      );

      return {
        verb: methodHttpVerb,
        path: `${controllerPath}/${methodPath}`
      }
    });

    expect(fullPaths).toContainEqual({verb: RequestMethod.GET, path: 'guest/route-path-one'});
    expect(fullPaths).toContainEqual({verb: RequestMethod.GET, path: 'super/route-path-two'});
    expect(fullPaths).toContainEqual({verb: RequestMethod.POST, path: 'admin/route-path-three'});
  });
});
