import {
  Controller,
  Get,
  Module,
  Post,
  Put,
  RequestMethod,
  SetMetadata,
} from '@nestjs/common';
import { METHOD_METADATA, PATH_METADATA } from '@nestjs/common/constants';
import { Test, TestingModule } from '@nestjs/testing';
import { describe, it, expect, beforeEach } from 'vitest';
import { DiscoveryModule, DiscoveryService } from '.';
import { getComponentMetaAtKey } from './discovery.service';

const rolesKey = 'roles';
const Roles = (roles: string[]) => SetMetadata(rolesKey, roles);

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
  controllers: [GuestController, RolesMethodController, AdminController],
})
class ExampleModule {}

function createDuplicateController(path: string, response: string) {
  @Controller(path)
  @Roles(['guest'])
  class DuplicateController {
    @Get(response)
    method() {
      return response;
    }
  }

  return DuplicateController;
}

const DuplicateControllerOne = createDuplicateController(
  'duplicate-one',
  'duplicate-route-one',
);
const DuplicateControllerTwo = createDuplicateController(
  'duplicate-two',
  'duplicate-route-two',
);

@Module({
  imports: [DiscoveryModule],
  controllers: [DuplicateControllerOne, DuplicateControllerTwo],
})
class DuplicateControllerModule {}

describe('Advanced Controller Discovery', () => {
  let app: TestingModule;
  let discover: DiscoveryService;

  beforeEach(async () => {
    app = await Test.createTestingModule({
      imports: [DiscoveryModule, ExampleModule],
    }).compile();

    await app.init();

    discover = app.get<DiscoveryService>(DiscoveryService);
  });

  it('can discover all controllers with roles', async () => {
    const rolesControllers =
      await discover.controllersWithMetaAtKey<string[]>(rolesKey);

    expect(rolesControllers).toHaveLength(2);

    const guestControllers = rolesControllers.filter((x) =>
      x.meta.includes('guest'),
    );

    expect(guestControllers).toHaveLength(1);
    const [guestController] = guestControllers;
    expect(guestController.discoveredClass.injectType).toBe(GuestController);
    expect(guestController.discoveredClass.instance).toBeInstanceOf(
      GuestController,
    );
  });

  it('can discover controller methods with roles', async () => {
    const rolesMethods =
      await discover.controllerMethodsWithMetaAtKey<string[]>(rolesKey);

    expect(rolesMethods).toHaveLength(4);

    const guestMethods = rolesMethods.filter((x) => x.meta.includes('guest'));
    expect(guestMethods).toHaveLength(3);
  });

  it('can discover all controller methods decorated with guest roles or belonging to controllers with guest roles', async () => {
    const allMethods = await discover.methodsAndControllerMethodsWithMetaAtKey<
      string[]
    >(rolesKey, (x) => x.includes('guest'));

    expect(allMethods).toHaveLength(4);

    const fullPaths = allMethods.map((x) => {
      const controllerPath = getComponentMetaAtKey<string>(
        PATH_METADATA,
        x.discoveredMethod.parentClass,
      );

      const methodPath = Reflect.getMetadata(
        PATH_METADATA,
        x.discoveredMethod.handler,
      );
      const methodHttpVerb = Reflect.getMetadata(
        METHOD_METADATA,
        x.discoveredMethod.handler,
      );

      return {
        verb: methodHttpVerb,
        path: `${controllerPath}/${methodPath}`,
      };
    });

    expect(fullPaths).toContainEqual({
      verb: RequestMethod.GET,
      path: 'guest/route-path-one',
    });
    expect(fullPaths).toContainEqual({
      verb: RequestMethod.GET,
      path: 'super/route-path-two',
    });
    expect(fullPaths).toContainEqual({
      verb: RequestMethod.POST,
      path: 'admin/route-path-three',
    });
    expect(fullPaths).toContainEqual({
      verb: RequestMethod.PUT,
      path: 'guest/some-put-route',
    });
  });

  it('deduplicates methods by handler identity', async () => {
    const duplicateApp = await Test.createTestingModule({
      imports: [DuplicateControllerModule],
    }).compile();

    await duplicateApp.init();

    const duplicateDiscover =
      duplicateApp.get<DiscoveryService>(DiscoveryService);

    const methods =
      await duplicateDiscover.methodsAndControllerMethodsWithMetaAtKey<
        string[]
      >(rolesKey, (x) => x.includes('guest'));

    expect(methods).toHaveLength(2);

    const fullPaths = methods.map((x) => {
      const controllerPath = getComponentMetaAtKey<string>(
        PATH_METADATA,
        x.discoveredMethod.parentClass,
      );

      const methodPath = Reflect.getMetadata(
        PATH_METADATA,
        x.discoveredMethod.handler,
      );

      return `${controllerPath}/${methodPath}`;
    });

    expect(fullPaths).toContain('duplicate-one/duplicate-route-one');
    expect(fullPaths).toContain('duplicate-two/duplicate-route-two');

    await duplicateApp.close();
  });
});
