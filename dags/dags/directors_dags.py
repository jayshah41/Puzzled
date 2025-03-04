from airflow import DAG
from airflow.operators.dummy_operator import DummyOperator
from airflow.operators.python_operator import PythonOperator
from datetime import datetime
from pyspark import SparkConf
from pyspark.sql import SQLContext
from pyspark import SparkContext
from pyspark.sql import SparkSession
import re
from pyspark.sql.types import ArrayType, StringType
from pyspark.sql.functions import udf
from pyspark.sql.functions import lit
from pyspark.sql.functions import col
from pyspark.sql.functions import concat
from pyspark.sql.functions import to_json,struct
import pandas as pd
from pyspark.sql import functions as F
from pyspark.sql.functions import *
def check(colType):
    [digits, decimals] = re.findall(r'\d+', colType)
    return 'float' if decimals == '0' else 'double'
def director_data():
    jdbc_hostname="110.173.226.145"
    jdbc_port="49740"
    database="MakCorp"
    username="aws_dataload"
    password="MakCorp@2021#"
    spark = SparkSession.builder.master("local").appName("app name").config(conf=SparkConf()).config("spark.jars.packages", "com.crealytics:spark-excel_2.11:0.12.2").getOrCreate()
    jdbc_url = "jdbc:sqlserver://{0}:{1};database={2}".format(jdbc_hostname, jdbc_port, database)
    data_table="dbo.API_Directors"
    connection_details = {
        "user": username,
        "password": password,
        "driver": "com.microsoft.sqlserver.jdbc.SQLServerDriver",
    }

    d_df = spark.read.jdbc(url=jdbc_url, table=data_table, properties=connection_details)
    d_df = d_df.withColumnRenamed("ASXCode","ASX")

    d_df = d_df.select(
    [col(name) if 'decimal' not in colType else col(name).cast(check(colType)) for name, colType in d_df.dtypes]
    )

    jdbc_hostname="110.173.226.145"
    jdbc_port="49740"
    database="MakCorp"
    username="aws_dataload"
    password="MakCorp@2021#"
    spark = SparkSession.builder.master("local").appName("app name").config("spark.jars.packages", "com.crealytics:spark-excel_2.11:0.12.2").getOrCreate()
    jdbc_url = "jdbc:sqlserver://{0}:{1};database={2}".format(jdbc_hostname, jdbc_port, database)
    # data_table="dbo.API_MarketData2"
    data_table="API_Projects"
    connection_details = {
        "user": username,
        "password": password,
        "driver": "com.microsoft.sqlserver.jdbc.SQLServerDriver",
    }
    p_df = spark.read.jdbc(url=jdbc_url, table=data_table, properties=connection_details)
    p_df = p_df.select(
    [col(name) if 'decimal' not in colType else col(name).cast(check(colType)) for name, colType in p_df.dtypes]
    )
    # p_df.printSchema()
    p_df=p_df.withColumnRenamed("ASX Codes","ASXCODE").withColumnRenamed("Project Stage","Project_Stage").withColumnRenamed("Project Name","Project_Name")
    m_df1=p_df.select("Project_Stage","ASXCODE","Project_Name")
    m_df2=m_df1.toPandas()
    pdfs=[]
    for i in m_df2.groupby('ASXCODE'):
    #     print(i[1])
        pdf=i[1][["Project_Stage","ASXCODE","Project_Name"]].iloc[0:1]
        pdfs.append(pdf.to_dict('records')[0])
    df = pd.DataFrame(pdfs)
    sparkDF=spark.createDataFrame(df) 
    sparkDF=sparkDF.selectExpr("Project_Stage","ASXCODE","Project_Name")
    spark_fil2=sparkDF.join(d_df,sparkDF.ASXCODE  ==  d_df.ASX,"full")
    spark_fil2=spark_fil2.sort(spark_fil2.ASX)
    spark_fil2=spark_fil2.drop("ASXCODE")
    spark_fil2=spark_fil2.withColumnRenamed("Project_Stage","ProjectStage").withColumnRenamed("Project_Name","Project Name")
#finan
    jdbc_hostname="110.173.226.145"
    jdbc_port="49740"
    database="MakCorp"
    username="aws_dataload"
    password="MakCorp@2021#"
    spark = SparkSession.builder.master("local").appName("app name").config(conf=SparkConf()).config("spark.jars.packages", "com.crealytics:spark-excel_2.11:0.12.2").getOrCreate()
    jdbc_url = "jdbc:sqlserver://{0}:{1};database={2}".format(jdbc_hostname, jdbc_port, database)
    data_table="dbo.API_Financials"
    connection_details = {
        "user": username,
        "password": password,
        "driver": "com.microsoft.sqlserver.jdbc.SQLServerDriver",
    }

    fin_df = spark.read.jdbc(url=jdbc_url, table=data_table, properties=connection_details)
    fin_df = fin_df.select(
    [col(name) if 'decimal' not in colType else col(name).cast(check(colType)) for name, colType in fin_df.dtypes]
    )
    fin_df=fin_df.where(F.col("Period").like('%Q2%') | F.col("Period").like('%Q1%') | F.col("Period").like('%Q3%') | F.col("Period").like('%Q4%'))
    fin_df=fin_df.drop("FinancialsID")
    m_df1=fin_df.selectExpr("ASX as ASXCODE","BankBalance","ExplSpend","DevProdSpend")
    m_df2=m_df1.toPandas()
    pdfs=[]
    for i in m_df2.groupby('ASXCODE'):
        pdf=i[1][["BankBalance","ASXCODE","ExplSpend","DevProdSpend"]].iloc[0:1]
        pdfs.append(pdf.to_dict('records')[0])
    df = pd.DataFrame(pdfs)
    sparkDF=spark.createDataFrame(df) 
    sparkDF=sparkDF.selectExpr("BankBalance","ASXCODE","ExplSpend","DevProdSpend")
    spark_fil=sparkDF.join(spark_fil2,sparkDF.ASXCODE  ==  spark_fil2.ASX,"right")
    spark_fil=spark_fil.sort(spark_fil.ASX)
    spark_fil=spark_fil.drop("ASXCODE")
    # spark_fil=spark_fil.filter(col("Ann Date").isNotNull())
    spark_fil = spark_fil.withColumn('ProjectSpending', expr("ExplSpend + DevProdSpend"))
    # spark_fil = spark_fil.dropDuplicates(["Contact"])
    # df=df.dropDuplicates(subset = ['Contact'])
    spark_fil=spark_fil.withColumn('con', F.explode(F.array('ProjectArea'))).withColumn('con1', F.explode(F.array('ProjectCountry')))   \
                .groupby('BankBalance',
                 'ExplSpend',
                 'DevProdSpend',
                 'ProjectStage',
                 'ASX',
                 'Project Name',
                 'EditDate',
                 'Other Directorships and History',
                 'Contact',
                 'Title',
                 'Qualifications/Experience',
                 'Company',
                 'Shares Held',
                 'Percent Held',
                 'Total Shares',
                 'Start Market Cap',
                 'End Market Cap',
                 'Base Remuneration',
                 'Total Remuneration',
                 'Commencement Date',
                 'Resignation Date',
                 'Priority Commodities',
                 'LinkedIn',
                 'Start Project Stage',
                 'End Project Stage',
                 'Ann Date',
                 'Ann Link',
                 'Ann Type',
                 'Share Options',
                 'Performance Shares',
                 'Cash Bonus',
                 'About',
                 'ProjectSpending').agg(F.collect_set('con').alias('ProjectArea'),F.collect_set('con1').alias('ProjectCountry'))
    spark_fil=spark_fil.withColumn("Priority Commodities",split(col("Priority Commodities"), ","))
    spark_fil.write.format("org.elasticsearch.spark.sql").option("es.resource", '%s' % ('asx_directors')).option("es.net.http.auth.user", "elastic").option("es.net.http.auth.pass", "changeme").option("es.net.ssl", "true").option("es.nodes","http://54.66.84.237").option("es.port", "9200").option("es.nodes.wan.only","true").mode("overwrite").save()
    spark_fil.write.format("org.elasticsearch.spark.sql").option("es.resource", '%s' % ('asx_directors_tier1')).option("es.net.http.auth.user", "elastic").option("es.net.http.auth.pass", "changeme").option("es.net.ssl", "true").option("es.nodes","http://54.66.84.237").option("es.port", "9200").option("es.nodes.wan.only","true").mode("overwrite").save()
    spark_fil.write.format("org.elasticsearch.spark.sql").option("es.resource", '%s' % ('asx_directors_tier2')).option("es.net.http.auth.user", "elastic").option("es.net.http.auth.pass", "changeme").option("es.net.ssl", "true").option("es.nodes","http://54.66.84.237").option("es.port", "9200").option("es.nodes.wan.only","true").mode("overwrite").save()
with DAG('MakCorp_Directors_data_dag', description='Directors DAG', start_date=datetime(2018, 11, 1), catchup=False) as dag:
    start= DummyOperator(task_id='Directors_Data_Loading_Started')
    director_task	= PythonOperator(task_id='ASX_Director', python_callable=director_data)
    end= DummyOperator(task_id='Directors_Data_Loading_Completed')
    start >> director_task >>end 
