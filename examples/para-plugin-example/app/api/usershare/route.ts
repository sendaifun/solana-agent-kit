import { NextResponse } from 'next/server';
import db from './db';

// POST /api/usershare - Save user share data
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, userShare } = body;

    if (!email || !userShare) {
      return NextResponse.json(
        { error: 'Email and userShare are required' },
        { status: 400 }
      );
    }

    // Insert the data into the database
    db.insert({ email, userShare }, (err, newDoc) => {
      if (err) {
        return NextResponse.json(
          { error: 'Failed to save data' },
          { status: 500 }
        );
      }
    });

    return NextResponse.json({ message: 'Data saved successfully' });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// GET /api/usershare?email=xxx - Get user share data by email
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');

    if (!email) {
      return NextResponse.json(
        { error: 'Email parameter is required' },
        { status: 400 }
      );
    }

    return new Promise((resolve) => {
      db.findOne({ email }, (err, doc) => {
        if (err) {
          resolve(NextResponse.json(
            { error: 'Failed to retrieve data' },
            { status: 500 }
          ));
          return;
        }

        if (!doc) {
          resolve(NextResponse.json(
            { error: 'No data found for this email' },
            { status: 404 }
          ));
          return;
        }

        resolve(NextResponse.json(doc));
      });
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/usershare?email=xxx - Delete user share data by email
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');

    if (!email) {
      return NextResponse.json(
        { error: 'Email parameter is required' },
        { status: 400 }
      );
    }

    return new Promise((resolve) => {
      db.remove({ email }, {}, (err, numRemoved) => {
        if (err) {
          resolve(NextResponse.json(
            { error: 'Failed to delete data' },
            { status: 500 }
          ));
          return;
        }

        if (numRemoved === 0) {
          resolve(NextResponse.json(
            { error: 'No data found for this email' },
            { status: 404 }
          ));
          return;
        }

        resolve(NextResponse.json({ message: 'Data deleted successfully' }));
      });
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 