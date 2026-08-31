from database.db import db
from database.models import Report
from datetime import datetime


def save_report(report):

    try:

        new_report = Report(

            scan_id = report.get("scan_id"),

            report_path = report.get("file"),

            created_at = datetime.utcnow()

        )


        db.session.add(new_report)
        db.session.commit()

        report["id"] = new_report.id
        report["db_id"] = new_report.id

        return report



    except Exception as e:

        db.session.rollback()

        print(
            "REPORT DATABASE ERROR:",
            e
        )

        return report



def get_reports():

    reports = Report.query.all()


    result = []


    for report in reports:

        result.append({

            "id": report.id,

            "scan_id": report.scan_id,

            "report_path": report.report_path,

            "created_at": report.created_at

        })


    return result