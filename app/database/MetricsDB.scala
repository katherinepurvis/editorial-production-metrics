package database

import java.util.Date

import io.getquill.{PostgresJdbcContext, SnakeCase}
import models.db._
import org.joda.time.DateTime

class MetricsDB(val dbContext: PostgresJdbcContext[SnakeCase]) {
  import dbContext._

  private implicit val encodePublicationDate = MappedEncoding[DateTime, Date](d => d.toDate)
  private implicit val decodePublicationDate = MappedEncoding[Date, DateTime](d => new DateTime(d.getTime))

  private def applyFilters(q: Quoted[Query[Metric]])(implicit filters: MetricsFilters): Quoted[Query[Metric]] = quote {
    q.filter(metric => metric.commissioningDesk.map(_.toUpperCase) == lift(filters.desk.map(_.toUpperCase)))
  }

  def getComposerMetrics: List[ComposerMetric] =
    dbContext.run(
      quote {
        querySchema[ComposerMetric]("composer_metrics")
      })

  def insertComposerMetric(metric: ComposerMetric): Long =
    dbContext.run(
      quote {
        querySchema[ComposerMetric]("composer_metrics").insert(lift(metric))
      })

  def getForks: List[Fork] =
    dbContext.run(
      quote {
        querySchema[Fork]("forks")
      })

  def insertFork(fork: Fork): Long =
    dbContext.run(
      quote {
        querySchema[Fork]("forks").insert(lift(fork))
      })

  def getInCopyMetrics: List[InCopyMetric] =
    dbContext.run(
      quote {
        querySchema[InCopyMetric]("incopy_metrics")
      })

  def insertInCopyMetric(metric: InCopyMetric): Long =
    dbContext.run(
      quote {
        querySchema[InCopyMetric]("incopy_metrics").insert(lift(metric))
      })

  def getPublishingMetrics(implicit filters: MetricsFilters): List[Metric] =
    dbContext.run(
      quote {
        applyFilters(querySchema[Metric]("metrics"))
      })

  def insertPublishingMetric(metric: Metric): Long =
    dbContext.run(
      quote {
        querySchema[Metric]("metrics").insert(lift(metric))
      })
}
