from airflow.providers.amazon.aws.operators.glue import AwsGlueJobOperator
from datetime import datetime, timedelta
from airflow.operators.python import PythonOperator
from airflow import DAG
from airflow.models import XCom
from airflow.operators.dummy import DummyOperator
import json

def read_details(ds, **kwargs):
    print("[READING DETAILS]")
    path = '/usr/local/airflow/dags/glueDetails.json'
    f = open(path)    
    data = json.load(f)
    f.close()
    kwargs['ti'].xcom_push(key='details', value=data)


def run_glue_job(ds, **kwargs):
    details = kwargs['ti'].xcom_pull(key='details')

    job_arguments = {
        "--source_path": details["source_path"],
        "--sink_path": details["sink_path"]
        }
    
    submit_glue_job = AwsGlueJobOperator(
        task_id="submit_glue_job",
        job_name = details["job_name"],
        script_location= details["script_location"],
        s3_bucket= details["s3_bucket"],
        iam_role_name= details["iam_role_name"],
        region_name = details["region_name"],
        create_job_kwargs={"GlueVersion": "3.0", "NumberOfWorkers": 2, "WorkerType": "G.1X"},
        script_args=job_arguments,
        dag = dag
    )
    submit_glue_job.execute(context = kwargs)

      # Kill the Glue Job if it's still running
      # Sometimes the glue job is running twice, hence to prevent this
    # if submit_glue_job.job_id:
    #     submit_glue_job.kill()


default_args = {
    'owner': 'airflow',
    'depends_on_past': False,
    'start_date': datetime(2023, 3, 3),
    'email_on_failure': False,
    'email_on_retry': False,
    'retries': 1,
    'retry_delay': timedelta(minutes=5),
}

dag = DAG(
    'trigger_glue_dag',
    default_args=default_args,
    schedule_interval=None,
)


read_dets = PythonOperator(
    task_id = "read_details",
    python_callable = read_details,
    provide_context=True,
    dag = dag
)

glue_job_task = PythonOperator(
    task_id='glue_job_task',
    python_callable=run_glue_job,
    provide_context=True,
    dag = dag
)

start_task = DummyOperator(
    task_id='start_task',
    dag = dag
)

end_task = DummyOperator(
    task_id='end_task',
    dag = dag
)

start_task >> read_dets >> glue_job_task >> end_task
