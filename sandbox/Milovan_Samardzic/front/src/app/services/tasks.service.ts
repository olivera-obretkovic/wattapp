import { HttpClient } from '@angular/common/http'
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Task } from '../models/task.model';

@Injectable({
  providedIn: 'root'
})
export class TasksService {

  baseUrl = 'https://localhost:7233/api/tasks';

  constructor(private http: HttpClient) { }

  getAllTasks(): Observable<Task[]> {
    return this.http.get<Task[]>(this.baseUrl)
  }
  addCard(task: Task): Observable<Task> {
    task.taskID = '00000000-0000-0000-0000-000000000000';
    return this.http.post<Task>(this.baseUrl, task);
  }
  deleteTask(id: string): Observable<Task> {
    return this.http.delete<Task>(this.baseUrl + '/' + id);
  }
  updateTask(task: Task): Observable<Task> {
    return this.http.put<Task>(this.baseUrl + '/' + task.taskID, task)
  }
}
