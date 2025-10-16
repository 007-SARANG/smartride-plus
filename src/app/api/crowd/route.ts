import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import { collection, addDoc, query, where, getDocs, serverTimestamp } from "firebase/firestore";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { busId, userId, crowdLevel, location } = body;

    if (!busId || !userId || crowdLevel === undefined) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Add crowd report to Firestore
    const reportRef = await addDoc(collection(db, "crowdReports"), {
      busId,
      userId,
      crowdLevel,
      location,
      timestamp: serverTimestamp(),
    });

    // Calculate updated average crowd level
    const reportsQuery = query(
      collection(db, "crowdReports"),
      where("busId", "==", busId),
      where("timestamp", ">=", new Date(Date.now() - 15 * 60 * 1000)) // Last 15 minutes
    );

    const reportsSnapshot = await getDocs(reportsQuery);
    const reports = reportsSnapshot.docs.map((doc) => doc.data());

    const avgCrowdLevel =
      reports.reduce((sum, report) => sum + report.crowdLevel, 0) /
      reports.length;

    return NextResponse.json({
      success: true,
      reportId: reportRef.id,
      averageCrowdLevel: Math.round(avgCrowdLevel),
      totalReports: reports.length,
    });
  } catch (error) {
    console.error("Crowd report error:", error);
    return NextResponse.json(
      { error: "Failed to submit crowd report" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const busId = searchParams.get("busId");

    if (!busId) {
      return NextResponse.json(
        { error: "Bus ID is required" },
        { status: 400 }
      );
    }

    // Get recent crowd reports
    const reportsQuery = query(
      collection(db, "crowdReports"),
      where("busId", "==", busId),
      where("timestamp", ">=", new Date(Date.now() - 30 * 60 * 1000)) // Last 30 minutes
    );

    const reportsSnapshot = await getDocs(reportsQuery);
    const reports = reportsSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    const avgCrowdLevel =
      reports.length > 0
        ? Math.round(
            reports.reduce((sum: number, report: any) => sum + report.crowdLevel, 0) /
              reports.length
          )
        : 50; // Default to medium if no reports

    return NextResponse.json({
      averageCrowdLevel: avgCrowdLevel,
      totalReports: reports.length,
      reports: reports.slice(-5), // Return last 5 reports
    });
  } catch (error) {
    console.error("Crowd data error:", error);
    return NextResponse.json(
      { error: "Failed to fetch crowd data" },
      { status: 500 }
    );
  }
}
