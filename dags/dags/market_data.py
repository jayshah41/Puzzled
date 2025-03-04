from airflow import DAG
from airflow.operators.dummy_operator import DummyOperator
from airflow.operators.python_operator import PythonOperator
from datetime import datetime
from pyspark import SparkConf
from pyspark.sql import SQLContext
from pyspark import SparkContext
from pyspark.sql import SparkSession
import re
from pyspark.sql.types import ArrayType, StringType, TimestampType
from pyspark.sql.functions import udf
from pyspark.sql.functions import lit
from pyspark.sql.functions import col
from pyspark.sql.functions import concat
from pyspark.sql.functions import to_json,struct
import pandas as pd
from pyspark.sql import functions as F
from pyspark.sql.functions import *
from datetime import datetime, timedelta
from pyspark.sql import SparkSession
from pyspark.sql.functions import udf
from dateutil import relativedelta
from datetime import datetime
from pyspark.sql.functions import split
from pyspark.sql.types import StringType
from pyspark.sql.types import BooleanType
from pyspark.sql.functions import col

def check(colType):
    [digits, decimals] = re.findall(r'\d+', colType)
    return 'float' if decimals == '0' else 'double'
def market_data():
    def projectArea(text):
        print(text)
        return str(text).replace(" ,",";").split(";")
    def priorityCommodities(text):
        return str(text).replace(", ",",").replace(";",",").split(",")
    jdbc_hostname="110.173.226.145"
    jdbc_port="49740"
    database="MakCorp"
    username="aws_dataload"
    password="MakCorp@2021#"
    spark = SparkSession.builder.master("local").appName("app name").getOrCreate()
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
    p_df=p_df.withColumnRenamed("ASX Codes","ASXCODE").withColumnRenamed("Project Location State","Project_Location_State").withColumnRenamed("Project Stage","Project_Stage").withColumnRenamed("Project Name","Project_Name")
    m_df1=p_df.select("Project_Location_State","Project_Stage","ASXCODE","Project_Name")
    m_df2=m_df1.toPandas()
    pdfs=[]
    for i in m_df2.groupby('ASXCODE'):
        pdf=i[1][["Project_Location_State","Project_Stage","ASXCODE","Project_Name"]].iloc[0:1]
        pdfs.append(pdf.to_dict('records')[0])
    df = pd.DataFrame(pdfs)
    sparkDF=spark.createDataFrame(df) 
    sparkDF=sparkDF.selectExpr("Project_Location_State","Project_Stage","ASXCODE","Project_Name")
    jdbc_hostname="110.173.226.145"
    jdbc_port="49740"
    database="MakCorp"
    username="aws_dataload"
    password="MakCorp@2021#"
    # spark = SparkSession.builder.master("local").appName("app name").getOrCreate()
    jdbc_url = "jdbc:sqlserver://{0}:{1};database={2}".format(jdbc_hostname, jdbc_port, database)
    # data_table="dbo.API_MarketData2"
    data_table="API_MarketData2"
    connection_details = {
        "user": username,
        "password": password,
        "driver": "com.microsoft.sqlserver.jdbc.SQLServerDriver",
    }
    m_df = spark.read.jdbc(url=jdbc_url, table=data_table, properties=connection_details)
    # schema=m_df.schema
    # m_df = spark.read.format("csv").option("header","true").schema(schema).load("file:///usr/local/airflow/dags/Market_Data_230416.csv")
    current_date=m_df.sort(col("Changed")).select("Changed").select(last("Changed").alias("Changed")).toPandas().to_dict('records')[0]['Changed'].strftime("%Y-%m-%d")
    # m_df=m_df.filter((col("Changed")>=current_date))
    m_df = m_df.select(
    [col(name) if 'decimal' not in colType else col(name).cast(check(colType)) for name, colType in m_df.dtypes]
    )


    #WeeklyOpenPrice
    m_df=m_df.withColumn('Day', F.date_format('Changed', 'EEEE'))
    m_df=m_df.withColumn('change_time',col('Changed'))
    m_df=m_df.withColumn('change_time',col('change_time').cast("string"))
    valDict = m_df.select(split("change_time", " ").getItem(0).alias("date"), "ASX", "NewPrice").collect()
    valDictVolume = m_df.select(split("change_time", " ").getItem(0).alias("date"), "ASX", "NewVolume").collect()
    

    dict = {}
    for key, value, des in valDict:
        dict[(key, value)] = des

    dict_vol = {}
    for key, value, des in valDictVolume:
        dict_vol[(key, value)] = des


    def checkDay(date, day, asx): 
        date = date.split("-")
        yy = int(date[0])
        mm = int(date[1])
        dd = int(date[2].split(" ")[0])
        dt = datetime(yy,mm, dd)
        udt = dt

        if(day == 'Monday'):
            udt = dt - relativedelta.relativedelta(days=1)

        if(day == 'Tuesday'):
            udt = dt - relativedelta.relativedelta(days=1)

        if(day == 'Wednesday'):
            udt = dt - relativedelta.relativedelta(days=2)

        if(day == 'Thursday'):
            udt = dt - relativedelta.relativedelta(days=3)

        if(day == 'Friday'):
            udt = dt - relativedelta.relativedelta(days=4)

        if(day == 'Saturday'):
            udt = dt - relativedelta.relativedelta(days=5)

        if(day == 'Sunday'):
            udt = dt - relativedelta.relativedelta(days=6)

        dt = udt.strftime('%Y-%m-%d')
        try :
            value = dict[(dt, asx)]
            return value
        except:
            dt = datetime(yy,mm, dd).strftime('%Y-%m-%d')
            value = dict[(dt, asx)]
            # here instead of -1, the nearest previous value can be sent in the case of no existing appropriate value
            return value
        
    def checkMonth(date, day, asx): 
        date = date.split("-")
        target_month = date[0] + "-" + date[1]
        yy = int(date[0])
        mm = int(date[1])
        dd = int(date[2].split(" ")[0])

        dt = datetime(yy,mm, dd)
        udt = dt
        
        date_median = 1
        if (dd < date_median):
            udt = dt - relativedelta.relativedelta(months=1)
        udt = udt.replace(day=date_median)

        dt = udt.strftime('%Y-%m-%d')
        try :
            value = dict[(dt, asx)]
            return value
        except:
            value = 0
            for i in range(5):
                next_dt = dt.replace("01", "0"+str(i))
                if (next_dt, asx) in dict:
                    value = dict[(next_dt, asx)]
                    break
                else:
                    continue
            # here instead of -1, the nearest previous value can be sent in the case of no existing appropriate value
            return value

    def checkYear(date, day, asx): 
        date = date.split("-")
        target_year = date[0]
        yy = int(date[0])
        mm = int(date[1])
        dd = int(date[2].split(" ")[0])

        dt = datetime(yy,mm, dd)
        udt = dt
        
        udt = udt.replace(day=1, month=1)

        dt = udt.strftime('%Y-%m-%d')
        try :
            value = dict[(dt, asx)]
            return value
        except:
            value = 0
            for i in range(5):
                next_dt = dt.replace("01", "0"+str(i))
                if (next_dt, asx) in dict:
                    value = dict[(next_dt, asx)]
                    break
                else:
                    continue
            # here instead of -1, the nearest previous value can be sent in the case of no existing appropriate value
            return value

    def checkDayVol(date, day, asx): 
        date = date.split("-")
        yy = int(date[0])
        mm = int(date[1])
        dd = int(date[2].split(" ")[0])
        dt = datetime(yy,mm, dd)
        udt = dt

        if(day == 'Monday'):
            udt = dt - relativedelta.relativedelta(days=1)

        if(day == 'Tuesday'):
            udt = dt - relativedelta.relativedelta(days=1)

        if(day == 'Wednesday'):
            udt = dt - relativedelta.relativedelta(days=2)

        if(day == 'Thursday'):
            udt = dt - relativedelta.relativedelta(days=3)

        if(day == 'Friday'):
            udt = dt - relativedelta.relativedelta(days=4)

        if(day == 'Saturday'):
            udt = dt - relativedelta.relativedelta(days=5)

        if(day == 'Sunday'):
            udt = dt - relativedelta.relativedelta(days=6)

        dt = udt.strftime('%Y-%m-%d')
        try :
            value = dict_vol[(dt, asx)]
            return value
        except:
            dt = datetime(yy,mm, dd).strftime('%Y-%m-%d')
            value = dict_vol[(dt, asx)]
            # here instead of -1, the nearest previous value can be sent in the case of no existing appropriate value
            return value
        
    def checkMonthVol(date, day, asx): 
        date = date.split("-")
        target_month = date[0] + "-" + date[1]
        yy = int(date[0])
        mm = int(date[1])
        dd = int(date[2].split(" ")[0])

        dt = datetime(yy,mm, dd)
        udt = dt
        
        date_median = 1
        if (dd < date_median):
            udt = dt - relativedelta.relativedelta(months=1)
        udt = udt.replace(day=date_median)

        dt = udt.strftime('%Y-%m-%d')
        try :
            value = dict_vol[(dt, asx)]
            return value
        except:
            value = 0
            for i in range(5):
                next_dt = dt.replace("01", "0"+str(i))
                if (next_dt, asx) in dict_vol:
                    value = dict_vol[(next_dt, asx)]
                    break
                else:
                    continue
            # here instead of -1, the nearest previous value can be sent in the case of no existing appropriate value
            return value

    def checkYearVol(date, day, asx): 
        date = date.split("-")
        target_year = date[0]
        yy = int(date[0])
        mm = int(date[1])
        dd = int(date[2].split(" ")[0])

        dt = datetime(yy,mm, dd)
        udt = dt
        
        udt = udt.replace(day=1, month=1)

        dt = udt.strftime('%Y-%m-%d')
        try :
            value = dict_vol[(dt, asx)]
            return value
        except:
            value = 0
            for i in range(5):
                next_dt = dt.replace("01", "0"+str(i))
                if (next_dt, asx) in dict_vol:
                    value = dict_vol[(next_dt, asx)]
                    break
                else:
                    continue
            # here instead of -1, the nearest previous value can be sent in the case of no existing appropriate value
            return value

    def checkDayRelVol(date, day, asx): 
        date = date.split("-")
        yy = int(date[0])
        mm = int(date[1])
        dd = int(date[2].split(" ")[0])
        dt = datetime(yy,mm, dd)
        udt = dt

        if(day == 'Monday'):
            udt = dt - relativedelta.relativedelta(days=1)

        if(day == 'Tuesday'):
            udt = dt - relativedelta.relativedelta(days=1)

        if(day == 'Wednesday'):
            udt = dt - relativedelta.relativedelta(days=2)

        if(day == 'Thursday'):
            udt = dt - relativedelta.relativedelta(days=3)

        if(day == 'Friday'):
            udt = dt - relativedelta.relativedelta(days=4)

        if(day == 'Saturday'):
            udt = dt - relativedelta.relativedelta(days=5)

        if(day == 'Sunday'):
            udt = dt - relativedelta.relativedelta(days=6)

        dt = udt.strftime('%Y-%m-%d')
        try :
            value = dict_rel_vol[(dt, asx)]
            return value
        except:
            while udt > datetime(yy, 1, 1):
                udt -= relativedelta.relativedelta(days=1)
                dt_str = udt.strftime('%Y-%m-%d')
                if (dt_str, asx) in dict_rel_vol:
                    return dict_rel_vol[(dt_str, asx)]
        
    def checkMonthRelVol(date, day, asx): 
        date = date.split("-")
        target_month = date[0] + "-" + date[1]
        yy = int(date[0])
        mm = int(date[1])
        dd = int(date[2].split(" ")[0])

        dt = datetime(yy,mm, dd)
        udt = dt
        
        date_median = 1
        if (dd < date_median):
            udt = dt - relativedelta.relativedelta(months=1)
        udt = udt.replace(day=date_median)

        dt = udt.strftime('%Y-%m-%d')
        try :
            value = dict_rel_vol[(dt, asx)]
            return value
        except:
            value = 0
            for i in range(5):
                next_dt = dt.replace("01", "0"+str(i))
                if (next_dt, asx) in dict_rel_vol:
                    value = dict_rel_vol[(next_dt, asx)]
                    break
                else:
                    continue
            # here instead of -1, the nearest previous value can be sent in the case of no existing appropriate value
            return value

    def checkYearRelVol(date, day, asx): 
        date = date.split("-")
        target_year = date[0]
        yy = int(date[0])
        mm = int(date[1])
        dd = int(date[2].split(" ")[0])

        dt = datetime(yy,mm, dd)
        udt = dt
        
        udt = udt.replace(day=1, month=1)

        dt = udt.strftime('%Y-%m-%d')
        try :
            value = dict_rel_vol[(dt, asx)]
            return value
        except:
            value = 0
            for i in range(5):
                next_dt = dt.replace("01", "0"+str(i))
                if (next_dt, asx) in dict_rel_vol:
                    value = dict_rel_vol[(next_dt, asx)]
                    break
                else:
                    continue
            # here instead of -1, the nearest previous value can be sent in the case of no existing appropriate value
            return value

    def checkYeartest(date, day, asx): 
        date_str = date[:]
        date = date.split("-")
        yy = int(date[0])
        mm = int(date[1])
        dd = int(date[2].split(" ")[0])

        dt = datetime(yy,mm, dd)
        udt = dt
        
        udt = udt.replace(day=1, month=1)

        dt = udt.strftime('%Y-%m-%d')
        return dt + ' from ' + date_str
        
    def checkMonthtest(date, day, asx): 
        date_str = date[:]
        date = date.split("-")
        yy = int(date[0])
        mm = int(date[1])
        dd = int(date[2].split(" ")[0])

        dt = datetime(yy,mm, dd)
        udt = dt
        
        date_median = 1
        if (dd < date_median):
            udt = dt - relativedelta.relativedelta(months=1)
        udt = udt.replace(day=date_median)

        dt = udt.strftime('%Y-%m-%d')
        return dt + ' from ' + date_str
        
    udf_add_column_func = udf(checkDay, StringType())
    udf_add_column_func1 = udf(checkMonth, StringType())
    udf_add_column_func2 = udf(checkYear, StringType())

    udf_add_column_func_vol = udf(checkDayVol, StringType())
    udf_add_column_func1_vol = udf(checkMonthVol, StringType())
    udf_add_column_func2_vol = udf(checkYearVol, StringType())

    udf_add_column_func_rel_vol = udf(checkDayRelVol, StringType())
    udf_add_column_func1_rel_vol = udf(checkMonthRelVol, StringType())
    udf_add_column_func2_rel_vol = udf(checkYearRelVol, StringType())

    m_df = m_df.withColumn("WeekOpenPrice", udf_add_column_func(m_df["change_time"], m_df["Day"], m_df["ASX"]))
    m_df = m_df.withColumn("MonthOpenPrice", udf_add_column_func1(m_df["change_time"], m_df["Day"], m_df["ASX"]))
    m_df = m_df.withColumn("YearOpenPrice", udf_add_column_func2(m_df["change_time"], m_df["Day"], m_df["ASX"]))

    m_df = m_df.withColumn("WeekOpenVolume", udf_add_column_func_vol(m_df["change_time"], m_df["Day"], m_df["ASX"]))
    m_df = m_df.withColumn("MonthOpenVolume", udf_add_column_func1_vol(m_df["change_time"], m_df["Day"], m_df["ASX"]))
    m_df = m_df.withColumn("YearOpenVolume", udf_add_column_func2_vol(m_df["change_time"], m_df["Day"], m_df["ASX"]))


    udf_add_column_func1 = udf(checkMonthtest, StringType())
    udf_add_column_func2 = udf(checkYeartest, StringType())
    m_df = m_df.withColumn("MonthOpenPrice key", udf_add_column_func1(m_df["change_time"], m_df["Day"], m_df["ASX"]))
    m_df = m_df.withColumn("YearOpenPrice_key", udf_add_column_func2(m_df["change_time"], m_df["Day"], m_df["ASX"]))

    def skip_negative(value):
        if float(value) > 0:
            return True
        else:
            False
    skip_udf = udf(skip_negative, BooleanType())
    m_df = m_df.filter(skip_udf(col("WeekOpenPrice")))
    m_df = m_df.filter(skip_udf(col("MonthOpenPrice")))
    m_df = m_df.filter(skip_udf(col("YearOpenPrice")))

    # m_df=m_df.drop("Day")

    current_date=m_df.sort(col("Changed")).select("Changed").select(last("Changed").alias("Changed")).toPandas().to_dict('records')[0]['Changed'].strftime("%Y-%m-%d")
    # m_df=m_df.filter((m_df.Changed>=current_date))
    m_df = m_df.select(
    [col(name) if 'decimal' not in colType else col(name).cast(check(colType)) for name, colType in m_df.dtypes]
    )
    # if current_day=='Monday':
    #     m_df=m_df.withColumn("WeekOpenPrice",col("PrevPrice"))
    # else:
    #     m_df=m_df
    spark_fil1=m_df.join(sparkDF,m_df.ASX  ==  sparkDF.ASXCODE,"left")
    test_fs_df = spark_fil1
    spark_fil1=spark_fil1.sort(spark_fil1.ASX)
    spark_fil1=spark_fil1.drop("ASXCODE")
    spark_fil1=spark_fil1.withColumnRenamed("Project_Location_State","Project Location State").withColumnRenamed("Project_Stage","Project Stage").withColumnRenamed("Project_Name","Project Name")
    projectArea_udf = udf(projectArea,ArrayType(StringType()))
    # spark_fil1.na.fill(value=0).show()
    jdbc_hostname="110.173.226.145"
    jdbc_port="49740"
    database="MakCorp"
    username="aws_dataload"
    password="MakCorp@2021#"
    # spark = SparkSession.builder.master("local").appName("app name").config(conf=SparkConf()).getOrCreate()
    jdbc_url = "jdbc:sqlserver://{0}:{1};database={2}".format(jdbc_hostname, jdbc_port, database)
    data_table="dbo.API_Companies"
    connection_details = {
        "user": username,
        "password": password,
        "driver": "com.microsoft.sqlserver.jdbc.SQLServerDriver",
    }

    c_df = spark.read.jdbc(url=jdbc_url, table=data_table, properties=connection_details)
    c_df = c_df.withColumnRenamed("ASX Code","ASXCODE")
    c_df = c_df.withColumnRenamed("Total Shares","TotalShares")

    c_df = c_df.select(
    [col(name) if 'decimal' not in colType else col(name).cast(check(colType)) for name, colType in c_df.dtypes]
    )
    m_df1=c_df.select("ERP","ASXCODE", "Company", "TotalShares")
    m_df2=m_df1.toPandas()
    pdfs=[]
    for i in m_df2.groupby('ASXCODE'):
        pdf=i[1][["ERP","ASXCODE", "Company", "TotalShares"]].iloc[0:1]
        pdfs.append(pdf.to_dict('records')[0])
    df = pd.DataFrame(pdfs)
    sparkDF=spark.createDataFrame(df) 
    sparkDF=sparkDF.selectExpr("ERP","ASXCODE", "Company", "TotalShares")
    spark_fil2=sparkDF.join(spark_fil1,sparkDF.ASXCODE  ==  spark_fil1.ASX,"right")
    spark_fil2=spark_fil2.sort(spark_fil2.ASX)
    spark_fil2=spark_fil2.drop("ASX")
    spark_fil2=spark_fil2.withColumnRenamed("ASXCODE","ASX")
    # spark_fil2=spark_fil2.na.fill(value=0)

    #Add New Realative Volume
    spark_fil2 = spark_fil2.withColumn('NewRelativeVolume', F.round(col('NewVolume')/col('TotalShares'), 10))
    spark_fil2 = spark_fil2.withColumn('PrevRelativeVolume', F.round(col('PrevVolume')/col('TotalShares'), 10))

    valDictRelVolume = spark_fil2.select(
        when(col("change_time").isNotNull(), split(col("change_time"), ' ').getItem(0)).otherwise(None).alias("date"),
        "ASX",
        "NewRelativeVolume"
    ).collect()

    dict_rel_vol = {}
    for key, value, des in valDictRelVolume:
        dict_rel_vol[(key, value)] = des


    spark_fil2 = spark_fil2.withColumn("WeekOpenRelativeVolume", F.round(col('WeekOpenVolume')/col('TotalShares'), 10))
    spark_fil2 = spark_fil2.withColumn("MonthOpenRelativeVolume", F.round(col('MonthOpenVolume')/col('TotalShares'), 10))
    spark_fil2 = spark_fil2.withColumn("YearOpenRelativeVolume", F.round(col('YearOpenVolume')/col('TotalShares'), 10))

    spark_fil2 = spark_fil2.withColumn("day_int", dayofmonth(col("ChangedText"))) \
           .withColumn("week", weekofyear(col("ChangedText"))) \
           .withColumn("month", month(col("ChangedText"))) \
           .withColumn("year", year(col("ChangedText")))  

    spark_fil2 = spark_fil2.withColumn(
        "monthyear",
        when((col("month").isNotNull()) & (col("year").isNotNull()),
            F.concat(F.lpad(col("month").cast("string"), 2, "0"),col("year").cast("string"))
        ).otherwise(lit("000000"))
)

    spark_fil2 = spark_fil2.withColumn(
        "rvolume_weekly_change",
        when((col('NewRelativeVolume').isNotNull()) & (col('WeekOpenRelativeVolume').isNotNull()) & (col('WeekOpenRelativeVolume') != 0),
            F.round((F.col('NewRelativeVolume') - F.col('WeekOpenRelativeVolume')) / F.col('WeekOpenRelativeVolume') * 100 / 100,4)
        ).otherwise(lit(0))
    )

    spark_fil2 = spark_fil2.withColumn(
        "rvolume_monthly_change",
        when((col('NewRelativeVolume').isNotNull()) & (col('MonthOpenRelativeVolume').isNotNull()) & (col('MonthOpenRelativeVolume') != 0),
            F.round((F.col('NewRelativeVolume') - F.col('MonthOpenRelativeVolume')) / F.col('MonthOpenRelativeVolume') * 100 / 100,4)
        ).otherwise(lit(0))
    )

    spark_fil2 = spark_fil2.withColumn(
        "rvolume_yearly_change",
        when((col('NewRelativeVolume').isNotNull()) & (col('YearOpenRelativeVolume').isNotNull()) & (col('YearOpenRelativeVolume') != 0),
            F.round((F.col('NewRelativeVolume') - F.col('YearOpenRelativeVolume')) / F.col('YearOpenRelativeVolume') * 100 / 100,4)
        ).otherwise(lit(0))
    )

    spark_fil2 = spark_fil2.withColumn(
        "price_weekly_change",
        when((col('NewPrice').isNotNull()) & (col('WeekOpenPrice').isNotNull()) & (col('WeekOpenPrice') != 0),
            F.round((F.col('NewPrice') - F.col('WeekOpenPrice')) / F.col('WeekOpenPrice') * 100 / 100,4)
        ).otherwise(lit(0.00))
    )

    spark_fil2 = spark_fil2.withColumn(
        "price_monthly_change",
        when((col('NewPrice').isNotNull()) & (col('MonthOpenPrice').isNotNull()) & (col('MonthOpenPrice') != 0),
            F.round((F.col('NewPrice') - F.col('MonthOpenPrice')) / F.col('MonthOpenPrice') * 100 / 100,4)
        ).otherwise(lit(0.00))
    )

    spark_fil2 = spark_fil2.withColumn(
        "price_yearly_change",
        when((col('NewPrice').isNotNull()) & (col('YearOpenPrice').isNotNull()) & (col('YearOpenPrice') != 0),
            F.round((F.col('NewPrice') - F.col('YearOpenPrice')) / F.col('YearOpenPrice') * 100 / 100,4)
        ).otherwise(lit(0.00))
    )
 
    jdbc_hostname="110.173.226.145"
    jdbc_port="49740"
    database="MakCorp"
    username="aws_dataload"
    password="MakCorp@2021#"
    spark = SparkSession.builder.master("local").appName("app name").config(conf=SparkConf()).getOrCreate()
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
    fin_df=fin_df.withColumn('con', F.explode(F.array('ProjectArea'))).withColumn('con1', F.explode(F.array('ProjectCountry')))   \
                    .groupby(
                    'EditDate',
                    'Period',
                    'ASX',
                    'AnnDate',
                    'NetOperatingCashFlow',
                    'CustomerIncome',
                    'OtherIncome',
                    'ExplSpend',
                    'DevProdSpend',
                    'StaffCosts',
                    'AdminCosts',
                    'OtherCosts',
                    'NetCashInvest',
                    'CashflowNegative',
                    'CashflowPositive',
                    'CashflowTotal',
                    'CashflowFin31',
                    'CashflowFin35_39',
                    'BankBalance',
                    'Debt',
                    'ForecastNetOperating',
                    'ForecastIncome',
                    'ForecastExplSpend',
                    'ForecastDevProdSpend',
                    'ForecastStaffCost',
                    'ForecastAdminCost',
                    'AnnWebLink',
                    'Best Project Stage',
                    'Contact',
                    'Title',
                    'Priority Commodities',
                    'CRDate',
                    'CRAmount',
                    'Salaries',
                    'EmployeeBenefits',
                    'ConsultingFees',
                    'Exploration',
                    'Production',
                    'AllOtherCosts',
                    'Income',
                    'ProfitandLoss',
                    'EarnperShare',
                    'Assets',
                    'Liabilities',
                    'Equity').agg(F.collect_set('con').alias('Project Location Area'),F.collect_set('con1').alias('ProjectCountry'))
    fin_df = fin_df.filter(F.col("Project Location Area")!=F.array(F.lit('')))
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
    spark_fil=spark_fil.drop("ASXCODE","MonthOpenPrice key","YearOpenPrice_key")
    spark_fil = spark_fil.withColumn('ProjectSpending', expr("ExplSpend + DevProdSpend"))
    # spark_fil.printSchema()
    priorityCommodities_udf=udf(priorityCommodities,ArrayType(StringType()))
    # # spark_fil=spark_fil.drop("LocationID")
    # spark_fil.withColumn("ProjectArea",projectArea_udf(spark_fil.ProjectArea)).withColumn("ProjectCountry",projectArea_udf(spark_fil.ProjectCountry)).withColumn("Priority Commodities",priorityCommodities_udf(col("Priority Commodities"))).write.format("org.elasticsearch.spark.sql").option("es.resource", '%s' % ('marketdata_public')).option("es.net.http.auth.user", "elastic").option("es.net.http.auth.pass", "changeme").option("es.net.ssl", "true").option("es.nodes","http://54.252.174.27").option("es.port", "9200").option("es.nodes.wan.only","true").mode("overwrite").save()
    # spark_fil.withColumn("ProjectArea",projectArea_udf(spark_fil.ProjectArea)).withColumn("ProjectCountry",projectArea_udf(spark_fil.ProjectCountry)).withColumn("Priority Commodities",priorityCommodities_udf(col("Priority Commodities"))).write.format("org.elasticsearch.spark.sql").option("es.resource", '%s' % ('marketdata_public_test')).option("es.net.http.auth.user", "elastic").option("es.net.http.auth.pass", "changeme").option("es.net.ssl", "true").option("es.nodes","http://54.252.174.27").option("es.port", "9200").option("es.nodes.wan.only","true").mode("overwrite").save()

    # spark_fil.withColumn("ProjectArea",projectArea_udf(spark_fil.ProjectArea)).withColumn("ProjectCountry",projectArea_udf(spark_fil.ProjectCountry)).withColumn("Priority Commodities",priorityCommodities_udf(col("Priority Commodities"))).write.format("org.elasticsearch.spark.sql").option("es.resource", '%s' % ('marketdata_public_tier1')).option("es.net.http.auth.user", "elastic").option("es.net.http.auth.pass", "changeme").option("es.net.ssl", "true").option("es.nodes","http://54.252.174.27").option("es.port", "9200").option("es.nodes.wan.only","true").mode("overwrite").save()
    # spark_fil.withColumn("ProjectArea",projectArea_udf(spark_fil.ProjectArea)).withColumn("ProjectCountry",projectArea_udf(spark_fil.ProjectCountry)).withColumn("Priority Commodities",priorityCommodities_udf(col("Priority Commodities"))).write.format("org.elasticsearch.spark.sql").option("es.resource", '%s' % ('marketdata_public_tier2')).option("es.net.http.auth.user", "elastic").option("es.net.http.auth.pass", "changeme").option("es.net.ssl", "true").option("es.nodes","http://54.252.174.27").option("es.port", "9200").option("es.nodes.wan.only","true").mode("overwrite").save()
    # spark_fil.withColumn("ProjectArea",projectArea_udf(spark_fil.ProjectArea)).withColumn("ProjectCountry",projectArea_udf(spark_fil.ProjectCountry)).withColumn("Priority Commodities",priorityCommodities_udf(col("Priority Commodities"))).write.format("org.elasticsearch.spark.sql").option("es.resource", '%s' % ('asx_marketdata_tier1')).option("es.net.http.auth.user", "elastic").option("es.net.http.auth.pass", "changeme").option("es.net.ssl", "true").option("es.nodes","http://54.252.174.27").option("es.port", "9200").option("es.nodes.wan.only","true").mode("overwrite").save()
    spark_fil.withColumn("ProjectArea",projectArea_udf(spark_fil.ProjectArea)).withColumn("ProjectCountry",projectArea_udf(spark_fil.ProjectCountry)).withColumn("Priority Commodities",priorityCommodities_udf(col("Priority Commodities"))).write.format("org.elasticsearch.spark.sql").option("es.resource", '%s' % ('asx_marketdata_tier2')).option("es.net.http.auth.user", "elastic").option("es.net.http.auth.pass", "changeme").option("es.net.ssl", "true").option("es.nodes","http://54.66.84.237").option("es.port", "9200").option("es.nodes.wan.only","true").mode("overwrite").save()

    # spark_fil=spark_fil.select("ERP").fillna("")
    # spark_fil.select("Changed").write.format("org.elasticsearch.spark.sql").option("es.resource", '%s' % ('asx_marketdata_tier2')).option("es.net.http.auth.user", "elastic").option("es.net.http.auth.pass", "changeme").option("es.net.ssl", "true").option("es.nodes","http://54.252.174.27").option("es.port", "9200").option("es.nodes.wan.only","true").mode("append").save()

    # spark_fil.select("Changed").withColumn("ProjectArea",projectArea_udf(spark_fil.ProjectArea)).withColumn("ProjectCountry",projectArea_udf(spark_fil.ProjectCountry)).withColumn("Priority Commodities",priorityCommodities_udf(col("Priority Commodities"))).write.format("org.elasticsearch.spark.sql").option("es.resource", '%s' % ('asx_marketdata_tier2')).option("es.net.http.auth.user", "elastic").option("es.net.http.auth.pass", "changeme").option("es.net.ssl", "true").option("es.nodes","http://54.252.174.27").option("es.port", "9200").option("es.nodes.wan.only","true").mode("append").save()
with DAG('MakCorp_marketdata_dag', description='MarketData DAG', start_date=datetime(2018, 11, 1), catchup=False) as dag:
    start= DummyOperator(task_id='Market_Data_Loading_Started')
    market_data_task    = PythonOperator(task_id='ASX_MarketData', python_callable=market_data)
    end= DummyOperator(task_id='Market_Data_Loading_Completed')
    start >> market_data_task >>end