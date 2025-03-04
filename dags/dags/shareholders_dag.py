from airflow import DAG
from airflow.operators.dummy_operator import DummyOperator
from airflow.operators.python_operator import PythonOperator
from datetime import datetime
from pyspark import SparkConf
from pyspark.sql import SQLContext
from pyspark import SparkContext
from pyspark.sql import SparkSession
import re
import pandas as pd
from pyspark.sql.types import ArrayType, StringType
from pyspark.sql.functions import udf
from pyspark.sql.functions import lit
from pyspark.sql.functions import col
from pyspark.sql.functions import concat
from pyspark.sql.functions import to_json,struct
from pyspark.sql import functions as F
from pyspark.sql.functions import *
def check(colType):
    [digits, decimals] = re.findall(r'\d+', colType)
    return 'float' if decimals == '0' else 'double'
def shareholder_data():
    jdbc_hostname="110.173.226.145"
    jdbc_port="49740"
    database="MakCorp"
    username="aws_dataload"
    password="MakCorp@2021#"
    spark = SparkSession.builder.master("local").appName("app name").config(conf=SparkConf()).config("spark.jars.packages", "com.crealytics:spark-excel_2.11:0.12.2").getOrCreate()
    jdbc_url = "jdbc:sqlserver://{0}:{1};database={2}".format(jdbc_hostname, jdbc_port, database)
    data_table="dbo.API_Shareholders"
    connection_details = {
        "user": username,
        "password": password,
        "driver": "com.microsoft.sqlserver.jdbc.SQLServerDriver",
    }

    s_df = spark.read.jdbc(url=jdbc_url, table=data_table, properties=connection_details)
    s_df = s_df.withColumnRenamed("ASXCode","ASX")
    s_df = s_df.select(
    [col(name) if 'decimal' not in colType else col(name).cast(check(colType)) for name, colType in s_df.dtypes]
)
    # df=df.dropDuplicates(subset = ['Contact'])
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
    spark_fil2=sparkDF.join(s_df,sparkDF.ASXCODE  ==  s_df.ASX,"full")
    spark_fil2=spark_fil2.sort(spark_fil2.ASX)
    spark_fil2=spark_fil2.drop("ASXCODE")
    spark_fil2=spark_fil2.withColumnRenamed("Project_Stage","ProjectStage").withColumnRenamed("Project_Name","Project Name")
    
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
    spark_fil=spark_fil.drop("ASXCODE")
    spark_fil = spark_fil.withColumn('ProjectSpending', expr("ExplSpend + DevProdSpend"))
    # spark_fil=spark_fil.dropDuplicates(["ASX","Priority Commodities","AnnType","AnnDate"])
    spark_fil=spark_fil.filter("AnnType != ''")
    jdbc_url = "jdbc:sqlserver://{0}:{1};database={2}".format(jdbc_hostname, jdbc_port, database)
    data_table="dbo.CUST_Shareholders"
    connection_details = {
        "user": username,
        "password": password,
        "driver": "com.microsoft.sqlserver.jdbc.SQLServerDriver",
    }

    cust_df = spark.read.jdbc(url=jdbc_url, table=data_table, properties=connection_details)
    cust_df=cust_df.selectExpr("ShareholdersID", "CUST_Entity_035311885 AS Entity_cust", "CUST_ASX_041426558","CUST_NatureOfChange_015344774 as Nature_Of_Change","CUST_Value_021307117 as Value","CUST_ShareholderTransactionTy_060601067 as Transaction_Type")
    # m_df2=cust_df.toPandas()
    # pdfs=[]
    # for i in m_df2.groupby('CUST_ASX_041426558'):
    #     pdf=i[1][["CUST_ASX_041426558","Nature_Of_Change","Value","Transaction_Type"]].iloc[0:1]
    #     pdfs.append(pdf.to_dict('records')[0])
    # df = pd.DataFrame(pdfs)
    # sparkDF=spark.createDataFrame(df) 
    sparkDF=cust_df.selectExpr("ShareholdersID", "Entity_cust", "CUST_ASX_041426558","Nature_Of_Change","cast(Value as STRING)","Transaction_Type")
    sparkDF=sparkDF.withColumn("Value_num", split(sparkDF['Value'], '\.')[0])
    sparkDF=sparkDF.withColumn("Value_num", col("Value_num").cast('double'))
    sparkDF=sparkDF.withColumn("Value", split(sparkDF['Value'], '\.')[0])
    sparkDF = sparkDF.withColumn("Value", concat(lit("$"), format_number(col("Value").cast("long"), 0)))
    sparkDF = sparkDF.withColumn("Value", col("Value").cast("string"))
    spark_fil=spark_fil.withColumnRenamed("ShareholdersID","Shareholders_ID")
    spark_fil_final=sparkDF.join(spark_fil,on=[(sparkDF.CUST_ASX_041426558  ==  spark_fil.ASX) & (sparkDF.Entity_cust  ==  spark_fil.Entity) & (sparkDF.ShareholdersID  ==  spark_fil.Shareholders_ID)], how="left")
    spark_fil_final=spark_fil_final.drop("CUST_ASX_041426558")
    spark_fil_final=spark_fil_final.drop("Entity")
    spark_fil_final=spark_fil_final.withColumnRenamed("Nature_Of_Change","Nature Of Change").withColumnRenamed("Transaction_Type","Transaction Type").withColumnRenamed("Entity_cust","Entity")
    spark_fil_final=spark_fil_final.withColumn('con1', F.explode(F.array('ProjectArea')))   \
                .groupby(
                    "Nature Of Change",
                    "Value",
                    "Value_num",
                    "Transaction Type",
                    "ProjectStage",
                    "Project Name",
                    "ShareholdersID",
                    "EditDate",
                    "Entity",
                    "Contact",
                    "JobTitle",
                    "AnnType",
                    "CurrentSharesHeld",
                    "PreviousSharesHeld",
                    "CurrentSharePercent",
                    "PreviousSharePercent",
                    "ASX",
                    "AnnDate",
                    "EntitySubName",
                    "SP Buy",
                    "Best Project Stage",
                    "Market Cap",
                    "Priority Commodities",
                    "Total Shares",
                    "ProjectCountry",
                    "Current Share Price",
                    ).agg(F.collect_set('con1').alias('ProjectArea'))
    spark_fil_final.write.format("org.elasticsearch.spark.sql").option("es.resource", '%s' % ('asx_shareholders_tier1')).option("es.net.http.auth.user", "elastic").option("es.net.http.auth.pass", "changeme").option("es.net.ssl", "true").option("es.nodes","http://54.66.84.237").option("es.port", "9200").option("es.nodes.wan.only","true").mode("overwrite").save()
    spark_fil_final.write.format("org.elasticsearch.spark.sql").option("es.resource", '%s' % ('asx_shareholders_tier2')).option("es.net.http.auth.user", "elastic").option("es.net.http.auth.pass", "changeme").option("es.net.ssl", "true").option("es.nodes","http://54.66.84.237").option("es.port", "9200").option("es.nodes.wan.only","true").mode("overwrite").save()
    
    # spark_fil.write.format("org.elasticsearch.spark.sql").option("es.resource", '%s' % ('asx_test_shareholders_tier1')).option("es.net.http.auth.user", "elastic").option("es.net.http.auth.pass", "changeme").option("es.net.ssl", "true").option("es.nodes","http://54.252.174.27").option("es.port", "9200").option("es.nodes.wan.only","true").mode("overwrite").save()
    # spark_fil.write.format("org.elasticsearch.spark.sql").option("es.resource", '%s' % ('asx_test_shareholders_tier2')).option("es.net.http.auth.user", "elastic").option("es.net.http.auth.pass", "changeme").option("es.net.ssl", "true").option("es.nodes","http://54.252.174.27").option("es.port", "9200").option("es.nodes.wan.only","true").mode("overwrite").save()
with DAG('MakCorp_Shareholder_data_dag', description='Shareholder DAG', start_date=datetime(2018, 11, 1), catchup=False) as dag:
    start= DummyOperator(task_id='Shareholder_Data_Loading_Started')
    shareholder_task    = PythonOperator(task_id='ASX_Shareholder', python_callable=shareholder_data)
    end= DummyOperator(task_id='Shareholder_Data_Loading_Completed')
    start >> shareholder_task >>end 