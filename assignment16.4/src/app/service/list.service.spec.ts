import { async, ComponentFixture, TestBed, getTestBed, inject } from '@angular/core/testing';
import { MockBackend, MockConnection } from '@angular/http/testing';
import {
  BaseRequestOptions, Http, XHRBackend, HttpModule,
  Response, ResponseOptions, RequestMethod
} from '@angular/http';
import { ListService } from "app/service/list.service";

describe('UserService', () => {
  let mockBackend: MockBackend;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      providers: [
        ListService,
        MockBackend,
        BaseRequestOptions,
        {
          provide: Http,
          deps: [MockBackend, BaseRequestOptions],
          useFactory:
          (backend: XHRBackend, defaultOptions: BaseRequestOptions) => {
            return new Http(backend, defaultOptions);
          }
        }
      ],
      imports: [
        HttpModule
      ]
    });
    mockBackend = getTestBed().get(MockBackend);
  }));

  it('should get userDetailList', (done) => {
    let userListService: ListService;

    getTestBed().compileComponents().then(() => {
      mockBackend.connections.subscribe(
        (connection: MockConnection) => {
          connection.mockRespond(new Response(
            new ResponseOptions({
              body: [
                {
                  'name': 'Sachin',
                  'lastName': 'Tendulkar',
                  'age': '12',
                  'gender': 'Mr',
                  'date': '2017-01-01'
                }
                ,
                {
                  'name': 'Rahul',
                  'lastName': 'Dravid',
                  'age': '12',
                  'gender': 'Mr',
                  'date': '2017-01-01'
                }
              ]
            }
            )));
        });

      userListService = getTestBed().get(ListService);
      expect(userListService).toBeDefined();

      userListService.getUserList().subscribe((userDetailList) => {
        expect(userDetailList.length).toBeDefined();
        expect(userDetailList.length).toEqual(2);
        expect(userDetailList.length).not.toBe(1);
        done();
      });
    });
  });

  it('should get userDetailList async',
    async(inject([ListService], (userListService: ListService) => {
      mockBackend.connections.subscribe(
        (connection: MockConnection) => {
          connection.mockRespond(new Response(
            new ResponseOptions({
              body: [
                {
                  'name': 'Rahul',
                  'lastName': 'Dravid',
                  'age': '12',
                  'gender': 'Mr',
                  'date': '2017-01-01'
                }]
            }
            )));
        });
      userListService.getUserList().subscribe(
        (response) => {
          expect(response.length).toBe(1);
          expect(response[0].gender).not.toBe('Mrs');
          expect(response[0].name).toBe('Rahul');
          expect(response).toEqual([{
            'name': 'Rahul',
            'lastName': 'Dravid',
            'age': '12',
            'gender': 'Mr',
            'date': '2017-01-01'
          }]);
        });
    })));


  it('should insert new user',
    async(inject([ListService], (service: ListService) => {
      mockBackend.connections.subscribe((connection: MockConnection) => {
        expect(connection.request.method).toBe(RequestMethod.Post);
        connection.mockRespond(new Response(new ResponseOptions({
          body: JSON.stringify({
            id: 201,
            message: `Sucessfully added`
          })
        })));
        const contentType = connection.request.headers.get('Content-Type');
        expect(contentType).not.toBeNull();
        expect(contentType).toEqual('application/json');
        expect(connection.request.url).toBe('http://localhost:3000/api/addUserDetail');
      });
      const result = service.addList({
        name: 'Rahul',
        lastName: 'Dravid',
        age: 12,
        gender: 'Mr',
        date: '2017-01-01'
      });
      result.subscribe(
        (successResult: any) => {
          console.log(successResult)
          expect(successResult).toBeDefined();
          expect(successResult).toEqual({
            id: 201,
            message: `Sucessfully added`
          });
        });
    })));
});
