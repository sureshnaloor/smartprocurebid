import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    
    const { data, error } = await supabase
      .from('material_classes')
      .select('*')
      .order('name');

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching material classes:', error);
    return NextResponse.json(
      { error: 'Failed to fetch material classes' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const { name, description } = await request.json();

    const { data, error } = await supabase
      .from('material_classes')
      .insert([{ name, description }])
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error creating material class:', error);
    return NextResponse.json(
      { error: 'Failed to create material class' },
      { status: 500 }
    );
  }
} 