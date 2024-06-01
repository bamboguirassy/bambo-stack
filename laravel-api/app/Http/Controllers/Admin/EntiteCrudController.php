<?php

namespace App\Http\Controllers\Admin;

use App\Http\Requests\EntiteRequest;
use Backpack\CRUD\app\Http\Controllers\CrudController;
use Backpack\CRUD\app\Library\CrudPanel\CrudPanelFacade as CRUD;

/**
 * Class EntiteCrudController
 * @package App\Http\Controllers\Admin
 * @property-read \Backpack\CRUD\app\Library\CrudPanel\CrudPanel $crud
 */
class EntiteCrudController extends CrudController
{
    use \Backpack\CRUD\app\Http\Controllers\Operations\ListOperation;
    use \Backpack\CRUD\app\Http\Controllers\Operations\CreateOperation;
    use \Backpack\CRUD\app\Http\Controllers\Operations\UpdateOperation;
    use \Backpack\CRUD\app\Http\Controllers\Operations\DeleteOperation;
    use \Backpack\CRUD\app\Http\Controllers\Operations\ShowOperation;

    /**
     * Configure the CrudPanel object. Apply settings to all operations.
     * 
     * @return void
     */
    public function setup()
    {
        CRUD::setModel(\App\Models\Entite::class);
        CRUD::setRoute(config('backpack.base.route_prefix') . '/entite');
        CRUD::setEntityNameStrings('entite', 'entites');
    }

    /**
     * Define what happens when the List operation is loaded.
     * 
     * @see  https://backpackforlaravel.com/docs/crud-operation-list-entries
     * @return void
     */
    protected function setupListOperation()
    {
        // CRUD::setFromDb(); // set columns from db columns.

        /**
         * Columns can be defined using the fluent syntax:
         * - CRUD::column('price')->type('number');
         */
        CRUD::column('row_number')->type('row_number')->label('#');
        CRUD::column('nom');
        CRUD::column('code');
        CRUD::column('description');
        CRUD::column('enabled')->type('check');
        CRUD::column('typeEntite')->label('Type Entite')->attribute('nom');
        CRUD::column('parent')->label('Entite Parente')->attribute('nom');
    }

    /**
     * Define what happens when the Create operation is loaded.
     * 
     * @see https://backpackforlaravel.com/docs/crud-operation-create
     * @return void
     */
    protected function setupCreateOperation()
    {
        CRUD::setValidation(EntiteRequest::class);
        CRUD::field('typeEntite')->attribute('nom')->label('Type Entite');
        CRUD::field('parent')->label('Parent Entite')->attribute('nom');
        CRUD::field('nom');
        CRUD::field('code');
        CRUD::field('description');

        // CRUD::setFromDb(); // set fields from db columns.
    }

    /**
     * Define what happens when the Update operation is loaded.
     * 
     * @see https://backpackforlaravel.com/docs/crud-operation-update
     * @return void
     */
    protected function setupUpdateOperation()
    {
        CRUD::setValidation(EntiteRequest::class);
        CRUD::field('nom');
        CRUD::field('code');
        CRUD::field('description');
        CRUD::field('enabled');
        CRUD::field('type_entite_id');
        CRUD::field('parent_id');
    }
}
