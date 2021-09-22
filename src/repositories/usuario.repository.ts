import {inject, Getter} from '@loopback/core';
import {DefaultCrudRepository, repository, HasManyThroughRepositoryFactory} from '@loopback/repository';
import {MongodbDataSource} from '../datasources';
import {Usuario, UsuarioRelations, Rol, UsuarioRol} from '../models';
import {UsuarioRolRepository} from './usuario-rol.repository';
import {RolRepository} from './rol.repository';

export class UsuarioRepository extends DefaultCrudRepository<
  Usuario,
  typeof Usuario.prototype._id,
  UsuarioRelations
> {

  public readonly tiene_roles: HasManyThroughRepositoryFactory<Rol, typeof Rol.prototype._id,
          UsuarioRol,
          typeof Usuario.prototype._id
        >;

  constructor(
    @inject('datasources.mongodb') dataSource: MongodbDataSource, @repository.getter('UsuarioRolRepository') protected usuarioRolRepositoryGetter: Getter<UsuarioRolRepository>, @repository.getter('RolRepository') protected rolRepositoryGetter: Getter<RolRepository>,
  ) {
    super(Usuario, dataSource);
    this.tiene_roles = this.createHasManyThroughRepositoryFactoryFor('tiene_roles', rolRepositoryGetter, usuarioRolRepositoryGetter,);
    this.registerInclusionResolver('tiene_roles', this.tiene_roles.inclusionResolver);
  }
}
